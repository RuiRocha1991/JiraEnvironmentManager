package com.example.jiramanage.enums;

import java.util.Arrays;

public enum SortUtils {
  ByName("by_name"), ByJiraServer("by_server"), ByJiraHome("by_home"), byDefault("default");

  private String name;

  SortUtils(String name) {
    this.name = name;
  }

  public static SortUtils getByName(String name) {
    return Arrays.stream(SortUtils.values()).filter(value -> value.getName().equals(name))
        .findFirst().orElse(SortUtils.byDefault);
  }

  public String getName() {
    return name;
  }
}
