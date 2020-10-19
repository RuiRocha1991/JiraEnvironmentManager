
package com.example.jiramanage.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Entity
@Data
@Table
@RequiredArgsConstructor
public class JiraBaseConfig {

  @Id
  @GeneratedValue
  private long Id;
  private String configType;
  private String config;
  private String name;

  public JiraBaseConfig(String configType, String config, String name) {
    this.configType = configType;
    this.config = config;
    this.name = name;
  }
}
