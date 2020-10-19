package com.example.jiramanage.service.impl;

import com.example.jiramanage.bean.CreateJiraInstanceBean;
import com.example.jiramanage.dao.CreateProcessDAO;
import com.example.jiramanage.enums.ProgressStatus;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class CreateProcessServiceImpl implements CreateProcessService {

  private static String TEMP_PATH = "./jira_tmp/";

  private CreateJiraInstanceBean createJiraInstanceBean;
  private Thread thread;

  @Autowired
  private CreateProcessDAO createProcessDAO;

  @Autowired
  private JiraInstanceService jiraInstanceService;


  @Override
  @Transactional
  public void save(CreateProcess createProcess) {
    createProcessDAO.save(createProcess);
  }


  @Override
  @Transactional
  @Async
  public void process(CreateJiraInstanceBean createJiraInstanceBean) {
    this.createJiraInstanceBean = createJiraInstanceBean;
    thread = new Thread(this::backgroundProcess, "aaaaaa");
    thread.start();
  }

  @Override
  @Transactional
  public Optional<CreateProcess> get(long id) {
    return Optional.ofNullable(createProcessDAO.get(id));
  }

  private void backgroundProcess() {
    CreateProcess createProcess = this.createProcessDAO
        .get(Long.valueOf(createJiraInstanceBean.getProcessId()));

    try {
      this.downloadJiraInstance(createProcess);
      createFolder(createJiraInstanceBean.getServerPath().concat(createJiraInstanceBean.getName()));
      createFolder(createJiraInstanceBean.getHomePath().concat(createJiraInstanceBean.getName()));
      updateProgressProcess(85, ProgressStatus.IN_PROGRESS, createProcess);

      unzipAndMoveToJiraServer(createProcess);

      JiraInstance jiraInstance = new JiraInstance(0, createJiraInstanceBean.getName(),
          createJiraInstanceBean.isHasQuickReload(),
          createJiraInstanceBean.getServerPath().concat(createJiraInstanceBean.getName()),
          createJiraInstanceBean.getHomePath().concat(createJiraInstanceBean.getName()),
          createJiraInstanceBean.getDescription());
      jiraInstance.setLastRunning(LocalDateTime.now());
      jiraInstanceService.save(jiraInstance);
      updateProgressProcess(100, ProgressStatus.FINISHED, createProcess);
      thread.interrupt();
    } catch (IOException e) {
      createProcess.setError(e.getMessage());
      updateProgressProcess(createProcess.getProgress(), ProgressStatus.CANCELED, createProcess);
      e.printStackTrace();
    }
  }

  private void downloadJiraInstance(CreateProcess createProcess) throws IOException {
    this.createFolder(TEMP_PATH);
    String command = "curl ".concat(createJiraInstanceBean.getUrl()).concat(" -L -o ")
        .concat(TEMP_PATH).concat(createJiraInstanceBean.getName()).concat(".tar.gz");
    Process process = Runtime.getRuntime().exec(command);
    final long finalSize = FileUtils.humanReadableToBytes(createJiraInstanceBean.getSize());
    while (process.isAlive()) {
      final long actualSize = FileUtils.getFolderSize(new File(TEMP_PATH));
      final int actualPercentageDone = (int) Math.ceil(actualSize * 100 / finalSize);
      updateProgressProcess((int) Math.ceil(actualPercentageDone * 80 / 100),
          ProgressStatus.IN_PROGRESS, createProcess);
    }
    updateProgressProcess(80, ProgressStatus.IN_PROGRESS, createProcess);
  }

  private void unzipAndMoveToJiraServer(CreateProcess createProcess) throws IOException {
    String command = "tar --extract --file ".concat(TEMP_PATH)
        .concat(createJiraInstanceBean.getName()).concat(".tar.gz").concat(" -C ")
        .concat(createJiraInstanceBean.getServerPath());
    Process process = Runtime.getRuntime().exec(command);
    final BufferedReader stdInput = new BufferedReader(
        new InputStreamReader(process.getInputStream()));

    while (process.isAlive() || ((stdInput.readLine()) != null)) {

    }

    File tarGz = new File(TEMP_PATH.concat(createJiraInstanceBean.getName()).concat(".tar.gz"));
    tarGz.delete();

    File file = new File(createJiraInstanceBean.getServerPath());
    String[] directories = file.list(new FilenameFilter() {
      @Override
      public boolean accept(File current, String name) {
        return new File(current, name).isDirectory();
      }
    });

    List<JiraInstance> jiraInstanceList = jiraInstanceService.get();

    for (String dir : directories) {
      boolean exist = false;
      if (!dir.equals(createJiraInstanceBean.getName())) {
        for (JiraInstance jiraInstance : jiraInstanceList) {
          if (jiraInstance.getServerPath().contains(dir)) {
            exist = true;
            break;
          }
        }
        if (!exist) {
          File oldDir = new File(createJiraInstanceBean.getServerPath().concat(dir));
          File newDir = new File(
              oldDir.getParent().concat("/").concat(createJiraInstanceBean.getName()));
          oldDir.renameTo(newDir);

          break;
        }
      }
    }
    updateProgressProcess(95, ProgressStatus.IN_PROGRESS, createProcess);
  }

  @Transactional
  public void updateProgressProcess(int progress, ProgressStatus progressStatus,
      CreateProcess createProcess) {
    createProcess.setProgress(progress);
    createProcess.setStatus(progressStatus.name());
    this.save(createProcess);
  }

  private void createFolder(String path) {
    File file = new File(path);
    if (!file.exists()) {
      file.mkdir();
    }
  }


}
