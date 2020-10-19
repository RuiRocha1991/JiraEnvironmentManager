package com.example.jiramanage.model;

import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@NoArgsConstructor
@RequiredArgsConstructor
@Entity
@Table
public class JiraInstance {

  @Id
  @GeneratedValue
  private long Id;
  @NonNull
  @Column(unique = true)
  private String name;
  private boolean isRunning;
  private boolean hasQuickReload;
  private String serverPath;
  private String homePath;
  private String description;
  private String pid;
  private LocalDateTime lastRunning;

  public JiraInstance(long id, String name, boolean isRunning, boolean hasQuickReload,
      String serverPath, String homePath, String description) {
    Id = id;
    this.name = name;
    this.isRunning = isRunning;
    this.hasQuickReload = hasQuickReload;
    this.serverPath = serverPath;
    this.homePath = homePath;
    this.description = description;
    this.lastRunning = LocalDateTime.now();
  }

  public JiraInstance(long id, String name, boolean hasQuickReload,
      String serverPath, String homePath, String description) {
    Id = id;
    this.name = name;
    this.isRunning = false;
    this.hasQuickReload = hasQuickReload;
    this.serverPath = serverPath;
    this.homePath = homePath;
    this.description = description;
    this.lastRunning= LocalDateTime.now();
  }
}
