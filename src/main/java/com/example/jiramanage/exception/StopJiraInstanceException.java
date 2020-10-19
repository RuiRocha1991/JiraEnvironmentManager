package com.example.jiramanage.exception;

import lombok.Getter;


public class StopJiraInstanceException extends Exception {

  @Getter
  private String jiraWantStop;
  @Getter
  private String jiraIsRunning;


  public StopJiraInstanceException(String jiraWantStop, String jiraIsRunning) {
    super("You want to stop the ".concat(jiraWantStop)
        .concat(" instance but the one that is running is the ").concat(jiraIsRunning));
    this.jiraWantStop = jiraWantStop;
    this.jiraIsRunning = jiraIsRunning;
  }
}
