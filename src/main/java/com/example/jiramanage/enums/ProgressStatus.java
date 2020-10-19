
package com.example.jiramanage.enums;

public enum ProgressStatus {
  STARTED(1,"started"),
  IN_PROGRESS(2,"in_progress"),
  FINISHED(3,"finished"),
  CANCELED(4,"canceled");

  private String name;
  private int id;

  ProgressStatus(int id, String name) {
    this.name= name;
  }


}
