package com.example.jiramanage.bean;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class JiraInstanceToSortBean {

  private long Id;
  private String name;
  private boolean isRunning;
  private boolean hasQuickReload;
  private String serverPath;
  private String homePath;
  private long serverSize;
  private long homeSize;
  private String description;
  private String pid;
}
