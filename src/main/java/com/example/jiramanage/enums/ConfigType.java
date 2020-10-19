package com.example.jiramanage.enums;

import java.util.Arrays;
import java.util.Optional;

public enum ConfigType {
  ON_CREATE_JIRA("On Create Jira"), ON_DELETE_TMP_FILES("On Delete Temp Files");

  private String name;

  ConfigType(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public static Optional<ConfigType> getByName(String name) {
    return Arrays.stream(ConfigType.values()).filter(value -> value.getName().equals(name))
        .findFirst();
  }

}
