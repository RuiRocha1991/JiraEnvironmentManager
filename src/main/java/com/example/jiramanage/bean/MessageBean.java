
package com.example.jiramanage.bean;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MessageBean<T> {
  private T data;
  private String title;
  private String message;
  private int statusCode;
  private boolean isSuccess;


}
