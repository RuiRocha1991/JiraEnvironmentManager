package com.example.jiramanage.controller;

import com.example.jiramanage.bean.BaseConfigBean;
import com.example.jiramanage.bean.MessageBean;
import com.example.jiramanage.enums.ConfigType;
import com.example.jiramanage.exception.ConfigTypeException;
import com.example.jiramanage.model.JiraBaseConfig;
import com.example.jiramanage.service.JiraBaseConfigService;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class JiraBaseConfigController {

  @Autowired
  private JiraBaseConfigService jiraBaseConfigService;

  @GetMapping("/jirainstance/base/config/on/create")
  public MessageBean getBaseConfigOnCreate() {
    List<JiraBaseConfig> jiraBaseConfigList = jiraBaseConfigService.getOnCreateConfig();
    return MessageBean.builder().message("Config on Create").title("Get Config").isSuccess(true)
        .data(jiraBaseConfigList).statusCode(200).build();
  }

  @PostMapping("/jirainstance/base/config/delete/files")
  public MessageBean addBaseConfigOnDeleteTMPFiles() {

    return MessageBean.builder().message("Add new config").title("Add Config").isSuccess(true)
        .statusCode(200).build();
  }

  @GetMapping("/jirainstance/base/config/")
  public MessageBean getBaseConfig() {
    return MessageBean.builder().message("Get all base configs").title("Success").isSuccess(true)
        .data(jiraBaseConfigService.get()).statusCode(200).build();
  }

  @GetMapping("/jirainstance/base/config/type")
  public MessageBean getBaseConfigType() {
    return MessageBean.builder().message("Get all base configs").title("Success").isSuccess(true)
        .data(Arrays.stream(ConfigType.values()).map(ConfigType::getName)
            .collect(Collectors.toList())).statusCode(200).build();
  }

  @PostMapping("/jirainstance/base/config/")
  public MessageBean addBaseConfig(@RequestBody BaseConfigBean baseConfigBean) {
    try {
      jiraBaseConfigService.addConfig(baseConfigBean);
      return MessageBean.builder().message("Add new config").title("Add Config").isSuccess(true)
          .statusCode(200).build();
    } catch (ConfigTypeException e) {
      e.printStackTrace();
      return MessageBean.builder().message(e.getMessage()).title("Error Add Config")
          .isSuccess(false).statusCode(200).build();
    }
  }
}
