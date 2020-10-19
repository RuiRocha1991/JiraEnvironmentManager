package com.example.jiramanage.bean;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BaseConfigBean {

  private String configType;
  private String name;
  private String config;

}
