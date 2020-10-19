package com.example.jiramanage.enums;

import java.util.Arrays;

public enum OrderUtils {
  ASC("asc"), DESC("desc");

  private String name;

  OrderUtils(String name) {
    this.name = name;
  }

  public static OrderUtils getByName(String name) {
    return Arrays.stream(OrderUtils.values())
        .filter(value -> value.getName().equals(name)).findFirst()
        .orElse(OrderUtils.ASC);
  }

  private Object getName() {
    return this.name;
  }

}
