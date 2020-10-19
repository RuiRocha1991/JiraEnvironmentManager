package com.example.jiramanage.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@Entity
@Table
public class CreateProcess {

  @Id
  @GeneratedValue
  private long ID;
  private int progress;
  private String status;
  private String jiraInstanceName;
  private String error;

  public CreateProcess(long id, int progress, String status, String jiraInstanceName) {
    this.ID = id;
    this.status = status;
    this.progress = progress;
    this.jiraInstanceName = jiraInstanceName;
  }


}
