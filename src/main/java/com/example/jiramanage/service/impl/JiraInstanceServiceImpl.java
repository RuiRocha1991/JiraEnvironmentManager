package com.example.jiramanage.service.impl;

import static com.example.jiramanage.utils.FileUtils.convertSizeToHumanReadable;
import static com.example.jiramanage.utils.FileUtils.getFolderSize;

import com.example.jiramanage.bean.CreateJiraInstanceBean;
import com.example.jiramanage.bean.InstancePath;
import com.example.jiramanage.bean.JiraDownloadBean;
import com.example.jiramanage.bean.JiraInstanceBean;
import com.example.jiramanage.bean.JiraInstanceToSortBean;
import com.example.jiramanage.bean.StartStopJiraBean;
import com.example.jiramanage.dao.JiraInstanceDAO;
import com.example.jiramanage.enums.OrderUtils;
import com.example.jiramanage.enums.ProgressStatus;
import com.example.jiramanage.enums.SortUtils;
import com.example.jiramanage.exception.DeleteFileException;
import com.example.jiramanage.exception.DirectoryExistsException;
import com.example.jiramanage.exception.JiraInstanceIsRunningException;
import com.example.jiramanage.exception.NameAlreadyExistsException;
import com.example.jiramanage.exception.StopJiraInstanceException;
import com.example.jiramanage.model.CreateProcess;
import com.example.jiramanage.model.JiraInstance;
import com.example.jiramanage.service.CreateProcessService;
import com.example.jiramanage.service.JiraInstanceService;
import com.example.jiramanage.utils.FileUtils;
import java.io.BufferedReader;
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import javax.transaction.Transactional;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JiraInstanceServiceImpl implements JiraInstanceService {

  public static String PATH_BIN = "/bin/";

  @Autowired
  private CreateProcessService createProcessService;

  @Autowired
  private JiraInstanceDAO jiraInstanceDAO;


  @Transactional
  @Override
  public List<JiraInstance> get() {
    return jiraInstanceDAO.get();
  }

  @Transactional
  @Override
  public Optional<JiraInstance> get(long id) {
    return Optional.ofNullable(jiraInstanceDAO.get(id));
  }

  @Transactional
  @Override
  public void add(JiraInstance jiraInstance)
      throws NameAlreadyExistsException, DirectoryExistsException {
    List<JiraInstance> jiraInstanceList = jiraInstanceDAO.get();

    if (jiraInstanceList.stream().anyMatch(jira -> jira.getName().equals(jiraInstance.getName()))) {
      throw new NameAlreadyExistsException(
          "The name " + jiraInstance.getName() + " already exists");
    }

    File serverPath = new File(jiraInstance.getServerPath());
    File homePath = new File(jiraInstance.getHomePath());

    if (!serverPath.exists()) {
      throw new DirectoryExistsException(
          "The directory doesn't exists: ".concat(jiraInstance.getServerPath()));
    }

    if (!homePath.exists()) {
      throw new DirectoryExistsException(
          "The directory doesn't exists: ".concat(jiraInstance.getHomePath()));
    }
    jiraInstance.setLastRunning(LocalDateTime.now());
    jiraInstanceDAO.save(jiraInstance);
  }

  @Transactional
  @Override
  public void save(JiraInstance jiraInstance) {
    jiraInstanceDAO.save(jiraInstance);
  }

  @Transactional
  @Override
  public void delete(long id) {
    jiraInstanceDAO.delete(id);

  }

  @Transactional
  @Override
  public int addJiraInstancesBulk(InstancePath instancePath) {
    File file = new File(instancePath.getServerPath());
    String[] directories = file.list(new FilenameFilter() {
      @Override
      public boolean accept(File current, String name) {
        return new File(current, name).isDirectory();
      }
    });

    List<JiraInstance> jiraInstances = Optional.ofNullable(directories).map(
        dir -> Arrays.stream(dir).map(directory -> new JiraInstance(0, directory, false, false,
            instancePath.getServerPath() + directory, instancePath.getHomePath() + directory, ""))
            .collect(Collectors.toList())).orElse(Collections.emptyList());

    jiraInstances.parallelStream().forEach(this::save);

    return jiraInstances.size();
  }

  @Override
  public JiraInstanceBean convertJiraInstanceToBean(JiraInstance jiraInstance) {
    long homeSize = getFolderSize(new File(jiraInstance.getHomePath()));
    long serverSize = getFolderSize(new File(jiraInstance.getServerPath()));

    return JiraInstanceBean.builder().Id(jiraInstance.getId())
        .hasQuickReload(jiraInstance.isHasQuickReload()).homePath(jiraInstance.getHomePath())
        .homeSize(convertSizeToHumanReadable(homeSize)).isRunning(jiraInstance.isRunning())
        .name(jiraInstance.getName()).serverPath(jiraInstance.getServerPath())
        .serverSize(convertSizeToHumanReadable(serverSize))
        .description(jiraInstance.getDescription()).pid(jiraInstance.getPid())
        .lastRunning(jiraInstance.getLastRunning()).build();
  }

  @Override
  public List<JiraInstanceBean> getJiraInstancesSorted(SortUtils sortBy, OrderUtils order) {
    switch (sortBy) {
      case ByName:
        return order.equals(OrderUtils.ASC) ? this.orderByNameASC() : this.orderByNameDESC();
      case ByJiraServer:
        return order.equals(OrderUtils.ASC) ? this.orderByJiraSizeASC()
            : this.orderByJiraSizeDESC();
      case ByJiraHome:
        return order.equals(OrderUtils.ASC) ? this.orderByJiraHomeSizeASC()
            : this.orderByJiraHomeSizeDESC();
      default:
        return this.get().parallelStream().map(this::convertJiraInstanceToBean)
            .collect(Collectors.toList());
    }
  }

  @Override
  @Transactional
  public String startAndStopJira(StartStopJiraBean startStopJiraBean) throws Exception {
    final Optional<JiraInstance> optionalJiraInstance = this.getJiraInstanceIsRunning();
    if (optionalJiraInstance.isPresent() && startStopJiraBean.isStart()) {
      throw new JiraInstanceIsRunningException(optionalJiraInstance.get().getName(),
          "This instance ".concat(optionalJiraInstance.get().getName()).concat(" is running"));
    }

    if (startStopJiraBean.isStart()) {
      Optional<JiraInstance> opJiraInstance = this.get(startStopJiraBean.getId());
      if (opJiraInstance.isPresent()) {
        return startJiraInstance(opJiraInstance.get());

      }
      throw new Exception("Instance is not exist");

    } else {
      if (optionalJiraInstance.isPresent()) {
        if (optionalJiraInstance.get().getId() == startStopJiraBean.getId()) {
          stopJiraInstance(optionalJiraInstance.get());
          return "";
        } else {
          Optional<JiraInstance> opJiraInstance = this.get(startStopJiraBean.getId());
          String name = opJiraInstance.isPresent() ? opJiraInstance.get().getName() : "";
          throw new StopJiraInstanceException(name, optionalJiraInstance.get().getName());
        }
      } else {
        Optional<JiraInstance> opJiraInstance = this.get(startStopJiraBean.getId());
        String name = opJiraInstance.isPresent() ? opJiraInstance.get().getName() : "";
        throw new JiraInstanceIsRunningException(name,
            "This instance ".concat(name).concat(" is not running"));
      }
    }
  }

  @Override
  public Map<String, Map<String, List<JiraDownloadBean>>> getAllJiraVersions()
      throws IOException, JSONException {
    List<JiraDownloadBean> list = new ArrayList<>();

    list.addAll(getCurrentVersions());
    list.addAll(getArchivedVersions());

    return sortJiraVersionsByVersion(list);
  }

  @Override
  public String createJiraInstanceProcess(CreateJiraInstanceBean createJiraInstanceBean)
      throws NameAlreadyExistsException, DirectoryExistsException, JSONException {

    CreateProcess createProcess = new CreateProcess(0L, 0, ProgressStatus.STARTED.name(),
        createJiraInstanceBean.getName());

    createProcessService.save(createProcess);
    if (this.getByName(createJiraInstanceBean.getName()).isPresent()) {
      createProcess.setError("The name " + createJiraInstanceBean.getName() + " already exists");
      cancelProcess(createProcess);
      throw new NameAlreadyExistsException(
          "The name " + createJiraInstanceBean.getName() + " already exists");
    }

    if (isDirectoryExists(
        createJiraInstanceBean.getServerPath().concat(createJiraInstanceBean.getName()))) {
      createProcess.setError("The directory already exists: "
          .concat(createJiraInstanceBean.getServerPath().concat(createJiraInstanceBean.getName())));
      cancelProcess(createProcess);
      throw new DirectoryExistsException("The directory already exists: "
          .concat(createJiraInstanceBean.getServerPath().concat(createJiraInstanceBean.getName())));
    }

    if (isDirectoryExists(
        createJiraInstanceBean.getHomePath().concat(createJiraInstanceBean.getName()))) {
      createProcess.setError("The directory already exists: "
          .concat(createJiraInstanceBean.getHomePath().concat(createJiraInstanceBean.getName())));
      cancelProcess(createProcess);
      throw new DirectoryExistsException("The directory already exists: "
          .concat(createJiraInstanceBean.getHomePath().concat(createJiraInstanceBean.getName())));
    }

    createJiraInstanceBean.setProcessId(String.valueOf(createProcess.getID()));
    createProcessService.process(createJiraInstanceBean);
    Map<String, String> map = new HashMap<>();
    map.put("processId", createJiraInstanceBean.getProcessId());
    map.put("jiraName", createJiraInstanceBean.getName());

    JSONObject jsonObject = new JSONObject();

    try {
      jsonObject.put("processId", createJiraInstanceBean.getProcessId());
      jsonObject.put("jiraName", createJiraInstanceBean.getName());
    } catch (JSONException e) {
      createProcess.setError(e.getMessage());
      cancelProcess(createProcess);
      throw new JSONException(e.getMessage());
    }

    return jsonObject.toString();
  }

  @Override
  public String deleteTempFilesOnServer(long id) throws DeleteFileException {
    final JiraInstance jiraInstance = jiraInstanceDAO.get(id);
    final long size;
    File serverPath = new File(jiraInstance.getServerPath() + File.separator + "temp");
    size = FileUtils.deleteTempFile(serverPath);
    return FileUtils.convertSizeToHumanReadable(size);
  }

  @Override
  public String deleteTempFilesOnHome(long id) throws DeleteFileException {
    final JiraInstance jiraInstance = jiraInstanceDAO.get(id);
    final long size;
    File homePath = new File(
        jiraInstance.getHomePath() + "/plugins/.osgi-plugins/transformed-plugins");
    size = FileUtils.deleteTempFile(homePath);
    return FileUtils.convertSizeToHumanReadable(size);
  }

  private void cancelProcess(CreateProcess createProcess) {
    createProcess.setStatus(ProgressStatus.CANCELED.name());
    createProcessService.save(createProcess);
  }

  private Optional<JiraInstance> getByName(String name) {
    return this.get().stream().filter(jiraInstance -> jiraInstance.getName().equals(name))
        .findFirst();
  }

  private boolean isDirectoryExists(String path) {
    File theDir = new File(path);
    return theDir.exists();
  }

  private List<JiraDownloadBean> getCurrentVersions() throws IOException, JSONException {
    final String command = "curl -i -H \"Accept: application/json\" -H \"Content-Type: "
        + "application/json\" -X GET https://my.atlassian"
        + ".com/download/feeds/current/jira-software.json";

    final Process process = Runtime.getRuntime().exec(command);
    final BufferedReader stdInput = new BufferedReader(
        new InputStreamReader(process.getInputStream()));
    String sResponse = null;
    String response = "";
    boolean found = false;
    String responseReplaced = "";
    // TODO throw an exception when stdInput is null.

    while (((sResponse = stdInput.readLine()) != null)) {
      if (!found) {
        found = sResponse.contains("downloads(");
      }
      if (found) {
        if (sResponse.contains("downloads(")) {
          responseReplaced = sResponse.replace("downloads(", "{\"downloads\":");
        }
        if (responseReplaced.contains("}])")) {
          responseReplaced = responseReplaced.replace("}])", "}]}");
        }
        response = response.concat(responseReplaced);
      }
    }
    return jsonToJiraDownloadBean(response);
  }

  private List<JiraDownloadBean> getArchivedVersions() throws IOException, JSONException {
    final String command = "curl -i -H \"Accept: application/json\" -H \"Content-Type: "
        + "application/json\" -X GET https://my.atlassian"
        + ".com/download/feeds/archived/jira-software.json";

    final Process process = Runtime.getRuntime().exec(command);
    final BufferedReader stdInput = new BufferedReader(
        new InputStreamReader(process.getInputStream()));
    String sResponse = null;
    String response = "";
    boolean found = false;
    String responseReplaced = "";

    while (((sResponse = stdInput.readLine()) != null)) {
      if (!found) {
        found = sResponse.contains("downloads(");
      }
      if (found) {
        if (sResponse.contains("downloads(")) {
          responseReplaced = sResponse.replace("downloads(", "{\"downloads\":");
        }
        if (responseReplaced.contains("}])")) {
          responseReplaced = responseReplaced.replace("}])", "}]}");
        }
        response = response.concat(responseReplaced);
      }
    }
    return jsonToJiraDownloadBean(response);
  }

  private List<JiraDownloadBean> jsonToJiraDownloadBean(String response) throws JSONException {
    final String systemInfo = System.getProperties().get("os.name").toString();
    JSONObject jsonObject = new JSONObject(response);

    JSONArray jsonArray = jsonObject.getJSONArray("downloads");
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d-MMM-yyyy");

    return IntStream.range(0, jsonArray.length()).mapToObj(jsonArray::optJSONObject)
        .filter(obj -> obj.optString("platform").contains(systemInfo)).map(
            obj -> JiraDownloadBean.builder().description(obj.optString("description"))
                .zipURL(obj.optString("zipUrl")).platform(obj.optString("platform"))
                .version(obj.optString("version")).size(obj.optString("size"))
                .released(LocalDate.parse(obj.optString("released"), formatter)).build())
        .collect(Collectors.toList());
  }

  private Map<String, Map<String, List<JiraDownloadBean>>> sortJiraVersionsByVersion(
      List<JiraDownloadBean> list) {
    Map<String, Map<String, List<JiraDownloadBean>>> map = new HashMap();

    list.forEach(jiraDownloadBean -> {
      String vMajor = jiraDownloadBean.getVersion().split("\\.")[0];
      String vMinor =
          jiraDownloadBean.getVersion().split("\\.")[0] + "." + jiraDownloadBean.getVersion()
              .split("\\.")[1];
      Map<String, List<JiraDownloadBean>> jiraMajors;
      List<JiraDownloadBean> jiraMinors;
      if (isSupported(jiraDownloadBean.getVersion())) {
        if (map.containsKey(vMajor)) {
          jiraMajors = map.get(vMajor);
          if (jiraMajors.containsKey(vMinor)) {
            jiraMinors = jiraMajors.get(vMinor);
            jiraMinors.add(jiraDownloadBean);
            jiraMajors.put(vMinor, jiraMinors);
          } else {
            jiraMinors = new ArrayList<>();
            jiraMinors.add(jiraDownloadBean);
            jiraMajors.put(vMinor, jiraMinors);
          }
        } else {
          jiraMinors = new ArrayList<>();
          jiraMajors = new HashMap<>();
          jiraMinors.add(jiraDownloadBean);
          jiraMajors.put(vMinor, jiraMinors);
          map.put(vMajor, jiraMajors);
        }
      }
    });

    map.entrySet().stream().map(major -> major.getValue().entrySet().stream().map(
        minor -> minor.getValue().stream().sorted(Comparator.comparing(
            jira -> jira.getVersion().split("\\.")[1] + "." + jira.getVersion().split("\\.")[2]))))
        .collect(Collectors.toList());

    return map;
  }

  private boolean isSupported(String version) {
    int vMajor = Integer.parseInt(version.split("\\.")[0]);
    int vMinor = Integer.parseInt(version.split("\\.")[1]);

    return vMajor > 7 || vMajor == 7 && vMinor >= 6;
  }

  private String startJiraInstance(JiraInstance jiraInstance)
      throws IOException, JiraInstanceIsRunningException, InterruptedException {
    jiraInstance.setRunning(true);
    String command = jiraInstance.getServerPath().concat(JiraInstanceServiceImpl.PATH_BIN)
        .concat("catalina.sh jpda start");
    Process process = Runtime.getRuntime().exec(command);
    BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
    String s = null;
    boolean isStarted = false;
    while ((s = stdInput.readLine()) != null) {
      isStarted = s.contains("Tomcat started.");
    }
    if (Objects.isNull(s) && !isStarted) {
      throw new JiraInstanceIsRunningException("Jira instance is Running",
          "Is there any instance of the jira running");
    }
    command = "ps -ef";
    process = Runtime.getRuntime().exec(command);
    stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
    AtomicReference<String> processPID = new AtomicReference<>("");
    AtomicInteger count = new AtomicInteger();
    while ((s = stdInput.readLine()) != null) {
      if (s.contains(jiraInstance.getServerPath())) {
        for (String st : s.split(" ")) {
          if (st.matches("[0-9]+")) {
            count.getAndIncrement();
            if (count.get() == 2) {
              processPID.set(st);
              break;
            }
          }
        }
        break;
      }
    }
    jiraInstance.setPid(processPID.get());
    jiraInstance.setLastRunning(LocalDateTime.now());
    this.save(jiraInstance);
    File log = new File(jiraInstance.getHomePath() + "/log/atlassian-jira.log");
    while (!log.exists()) {
      TimeUnit.SECONDS.sleep(2);
    }
    command = "open -a Terminal " + jiraInstance.getHomePath() + "/log/";
    Runtime.getRuntime().exec(command);
    return processPID.get();
  }

  private void stopJiraInstance(JiraInstance jiraInstance)
      throws IOException, JiraInstanceIsRunningException {
    jiraInstance.setRunning(false);
    String command =
        jiraInstance.getServerPath() + JiraInstanceServiceImpl.PATH_BIN + "catalina.sh stop -force";
    Process process = Runtime.getRuntime().exec(command);
    BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
    String s = null;
    boolean isStop = false;
    while ((s = stdInput.readLine()) != null) {
      isStop = s.contains("The Tomcat process has been killed");
    }
    if (Objects.isNull(s) && !isStop) {
      throw new JiraInstanceIsRunningException("Jira instance is still Running",
          "Something went wrong trying to stop the jira.");
    }
    jiraInstance.setPid("0");
    jiraInstance.setLastRunning(LocalDateTime.now());
    this.save(jiraInstance);
  }

  private Optional<JiraInstance> getJiraInstanceIsRunning() {
    return this.get().parallelStream().filter(JiraInstance::isRunning).findFirst();
  }

  private JiraInstanceToSortBean convertJiraInstancesToSort(JiraInstance jiraInstance) {
    return JiraInstanceToSortBean.builder().Id(jiraInstance.getId())
        .hasQuickReload(jiraInstance.isHasQuickReload()).homePath(jiraInstance.getHomePath())
        .homeSize(getFolderSize(new File(jiraInstance.getHomePath())))
        .isRunning(jiraInstance.isRunning()).name(jiraInstance.getName())
        .serverPath(jiraInstance.getServerPath())
        .serverSize(getFolderSize(new File(jiraInstance.getServerPath())))
        .description(jiraInstance.getDescription()).pid(jiraInstance.getPid()).build();
  }


  private JiraInstanceBean convertJiraInstanceToSortToBean(JiraInstanceToSortBean jiraInstance) {
    return JiraInstanceBean.builder().Id(jiraInstance.getId())
        .hasQuickReload(jiraInstance.isHasQuickReload()).homePath(jiraInstance.getHomePath())
        .homeSize(convertSizeToHumanReadable(jiraInstance.getHomeSize()))
        .isRunning(jiraInstance.isRunning()).name(jiraInstance.getName())
        .serverPath(jiraInstance.getServerPath())
        .serverSize(convertSizeToHumanReadable(jiraInstance.getServerSize()))
        .description(jiraInstance.getDescription()).pid(jiraInstance.getPid()).build();
  }


  private List<JiraInstanceBean> orderByNameASC() {
    return this.get().parallelStream().map(this::convertJiraInstanceToBean)
        .sorted(Comparator.comparing(JiraInstanceBean::getName)).collect(Collectors.toList());
  }

  private List<JiraInstanceBean> orderByNameDESC() {
    return this.get().parallelStream().map(this::convertJiraInstanceToBean)
        .sorted(Comparator.comparing(JiraInstanceBean::getName).reversed())
        .collect(Collectors.toList());
  }

  private List<JiraInstanceBean> orderByJiraSizeASC() {
    return this.get().parallelStream().map(this::convertJiraInstancesToSort)
        .sorted(Comparator.comparing(JiraInstanceToSortBean::getServerSize))
        .map(this::convertJiraInstanceToSortToBean).collect(Collectors.toList());
  }

  private List<JiraInstanceBean> orderByJiraSizeDESC() {
    return this.get().parallelStream().map(this::convertJiraInstancesToSort)
        .sorted(Comparator.comparing(JiraInstanceToSortBean::getServerSize).reversed())
        .map(this::convertJiraInstanceToSortToBean).collect(Collectors.toList());
  }

  private List<JiraInstanceBean> orderByJiraHomeSizeASC() {
    return this.get().parallelStream().map(this::convertJiraInstancesToSort)
        .sorted(Comparator.comparing(JiraInstanceToSortBean::getHomeSize))
        .map(this::convertJiraInstanceToSortToBean).collect(Collectors.toList());
  }

  private List<JiraInstanceBean> orderByJiraHomeSizeDESC() {
    return this.get().parallelStream().map(this::convertJiraInstancesToSort)
        .sorted(Comparator.comparing(JiraInstanceToSortBean::getHomeSize).reversed())
        .map(this::convertJiraInstanceToSortToBean).collect(Collectors.toList());
  }
}
