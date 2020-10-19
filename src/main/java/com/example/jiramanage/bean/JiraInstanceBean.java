
package com.example.jiramanage.bean;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class JiraInstanceBean {

  private long Id;
  private String name;
  private boolean isRunning;
  private boolean hasQuickReload;
  private String serverPath;
  private String homePath;
  private String serverSize;
  private String homeSize;
  private String description;
  private String pid;
  private LocalDateTime lastRunning;

}
