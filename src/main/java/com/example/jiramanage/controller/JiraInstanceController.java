package com.example.jiramanage.controller;

import com.example.jiramanage.bean.CreateJiraInstanceBean;
import com.example.jiramanage.bean.InstancePath;
import com.example.jiramanage.bean.JiraDownloadBean;
import com.example.jiramanage.bean.JiraInstanceBean;
import com.example.jiramanage.bean.MessageBean;
import com.example.jiramanage.bean.SetenvConfigBean;
import com.example.jiramanage.bean.StartStopJiraBean;
import com.example.jiramanage.enums.OrderUtils;
import com.example.jiramanage.enums.SortUtils;
import com.example.jiramanage.exception.DeleteFileException;
import com.example.jiramanage.exception.DirectoryExistsException;
import com.example.jiramanage.exception.NameAlreadyExistsException;
import com.example.jiramanage.model.JiraInstance;
import com.example.jiramanage.service.JiraInstanceService;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class JiraInstanceController {

  @Autowired
  private JiraInstanceService jiraInstanceService;

  @GetMapping("/jirainstance")
  public List<JiraInstanceBean> get() {
    return jiraInstanceService.get().parallelStream()
        .map(jiraInstance -> jiraInstanceService.convertJiraInstanceToBean(jiraInstance))
        .collect(Collectors.toList());
  }

  @PostMapping("/jirainstance")
  public MessageBean save(@RequestBody JiraInstance jiraInstance) {
    try {
      jiraInstanceService.add(jiraInstance);
      return MessageBean.builder().data(jiraInstance).title("Success")
          .message("Jira added successful").statusCode(200).isSuccess(true).build();
    } catch (NameAlreadyExistsException | DirectoryExistsException e) {
      e.printStackTrace();
      return MessageBean.builder().data(jiraInstance).title("Error").message(e.getMessage())
          .statusCode(400).isSuccess(false).build();
    }

  }

  @GetMapping("/jirainstance/{id}")
  public JiraInstance get(@PathVariable int id) {
    Optional<JiraInstance> jiraInstance = jiraInstanceService.get(id);
    return jiraInstance.get();
  }

  @PutMapping("/jirainstance")
  public MessageBean update(@RequestBody JiraInstance jiraInstance) {
    jiraInstanceService.save(jiraInstance);
    return MessageBean.builder().data(jiraInstance).title("Success")
        .message("Jira updated successful").statusCode(200).isSuccess(true).build();
  }

  @PostMapping("/instance/addBulk")
  public int addBulk(@RequestBody InstancePath instancePath) {
    return jiraInstanceService.addJiraInstancesBulk(instancePath);
  }

  @GetMapping("/jirainstance/order/{sortBy}/{order}")
  public List<JiraInstanceBean> getOrderBy(@PathVariable String sortBy,
      @PathVariable String order) {
    return jiraInstanceService
        .getJiraInstancesSorted(SortUtils.getByName(sortBy), OrderUtils.getByName(order));
  }

  @PostMapping("/jirainstance/startAndStop")
  public MessageBean startAndStopJira(@RequestBody StartStopJiraBean startStopJiraBean) {
    String processPID = "";
    try {
      processPID = jiraInstanceService.startAndStopJira(startStopJiraBean);
    } catch (Exception e) {
      return MessageBean.builder().title("Error").message(e.getMessage()).statusCode(205)
          .isSuccess(false).build();
    }
    return MessageBean.builder().title("Success").message(
        startStopJiraBean.isStart() ? "Jira started successful with process PID: " + processPID
            : "Jira stop successful").data(processPID).statusCode(200).isSuccess(true).build();
  }

  @GetMapping("/jirainstance/jira/versions")
  public MessageBean getJiraVersions() {
    try {
      Map<String, Map<String, List<JiraDownloadBean>>> map = jiraInstanceService
          .getAllJiraVersions();
      return MessageBean.builder().title("Load Jira Versions").message("Success load Jira Versions")
          .statusCode(200).isSuccess(true).data(map).build();
    } catch (JSONException | IOException e) {
      e.printStackTrace();
      return MessageBean.builder().title("Load Jira Versions").message("Error load Jira Versions")
          .statusCode(400).isSuccess(false).build();
    }
  }

  @PostMapping("jirainstance/create")
  public MessageBean createJiraInstance(
      @RequestBody CreateJiraInstanceBean createJiraInstanceBean) {
    String process = "";
    try {
      process = jiraInstanceService.createJiraInstanceProcess(createJiraInstanceBean);
      return MessageBean.builder().data(process).isSuccess(true).title("Success")
          .message("The jira instance is being created").build();
    } catch (NameAlreadyExistsException | DirectoryExistsException | JSONException e) {
      return MessageBean.builder().isSuccess(false).title("Error").message(e.getMessage()).build();
    }
  }

  @GetMapping("jirainstance/getByName/{name}")
  public MessageBean createJiraInstance(@PathVariable String name) {
    Optional optional = Optional.of(jiraInstanceService.get().parallelStream()
        .filter(jiraInstance -> jiraInstance.getName().equals(name)).findFirst());

    return MessageBean.builder().data(optional.get()).isSuccess(true).title("Success")
        .message("Success").statusCode(200).build();

  }

  @GetMapping("jirainstance/getSetenv/{id}")
  public MessageBean getSetenv(@PathVariable long id) {
    Optional<JiraInstance> optional = jiraInstanceService.get(id);
    File file = new File(optional.get().getServerPath().concat("/bin/setenv.sh"));
    String setenvString = "";
    try {
      setenvString = Files.readAllLines(file.toPath()).stream().map(Objects::toString)
          .collect(Collectors.joining("\n"));
    } catch (IOException e) {
      e.printStackTrace();
    }

    return MessageBean.builder().data(setenvString).isSuccess(true).title("Success")
        .message("Success").statusCode(200).build();

  }

  @PostMapping("jirainstance/setenv")
  public MessageBean setenv(@RequestBody SetenvConfigBean setenvConfigBean) {
    Optional<JiraInstance> optional = jiraInstanceService.get(setenvConfigBean.getId());
    try {
      Writer fileWriter = new FileWriter(optional.get().getServerPath().concat("/bin/setenv.sh"),
          false);
      fileWriter.write(setenvConfigBean.getSetenv());
      fileWriter.close();
    } catch (IOException e) {
      e.printStackTrace();
    }

    return MessageBean.builder().data(optional.get()).isSuccess(true).title("Success")
        .message("Success").statusCode(200).build();
  }

  @DeleteMapping("jirainstance/{id}")
  public MessageBean deleteJiraInstance(@PathVariable long id) {
    Optional<JiraInstance> optional = jiraInstanceService.get(id);
    File serverPath = new File(optional.get().getServerPath());
    File homePath = new File(optional.get().getHomePath());

    try {
      FileUtils.deleteDirectory(serverPath);
      FileUtils.deleteDirectory(homePath);
      jiraInstanceService.delete(id);
    } catch (IOException e) {
      e.printStackTrace();
    }

    return MessageBean.builder().data("success").isSuccess(true).title("Success").message("Success")
        .statusCode(200).build();
  }

  @DeleteMapping("jirainstance/delete/tmp/files/server/{id}")
  public MessageBean deleteTempFilesOnServer(@PathVariable long id) {
    try {
      final String sizeReadable = jiraInstanceService.deleteTempFilesOnServer(id);
      return MessageBean.builder().data("success").isSuccess(true).title("Success")
          .message("Were deleted " + sizeReadable).statusCode(200).build();
    } catch (DeleteFileException e) {
      e.printStackTrace();
      return MessageBean.builder().data("success").isSuccess(true).title("Success")
          .message("Error when delete some temp files").statusCode(200).build();
    }
  }

  @DeleteMapping("jirainstance/delete/tmp/files/home/{id}")
  public MessageBean deleteTempFilesOnHome(@PathVariable long id) {
    try {
      final String sizeReadable = jiraInstanceService.deleteTempFilesOnHome(id);
      return MessageBean.builder().data("success").isSuccess(true).title("Success")
          .message("Were deleted " + sizeReadable).statusCode(200).build();
    } catch (DeleteFileException e) {
      e.printStackTrace();
      return MessageBean.builder().data("success").isSuccess(true).title("Success")
          .message("Error when delete some temp files").statusCode(200).build();
    }
  }

}
