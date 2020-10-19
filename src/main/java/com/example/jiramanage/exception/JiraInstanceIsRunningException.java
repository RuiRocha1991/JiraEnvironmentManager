
package com.example.jiramanage.exception;

import lombok.Getter;
import lombok.NonNull;


public class JiraInstanceIsRunningException extends Exception {

  @Getter
  private String name;

  public JiraInstanceIsRunningException(@NonNull String name, String message) {
    super(message);
    this.name = name;
  }

}
