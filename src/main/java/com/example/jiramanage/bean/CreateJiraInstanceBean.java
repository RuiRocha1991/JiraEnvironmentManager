package com.example.jiramanage.bean;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CreateJiraInstanceBean {

  private String name;
  private boolean hasQuickReload;
  private String serverPath;
  private String homePath;
  private String description;
  private String url;
  private String processId;
  private String size;
}
