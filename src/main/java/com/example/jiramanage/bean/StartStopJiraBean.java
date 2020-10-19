
package com.example.jiramanage.bean;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StartStopJiraBean {
  private long id;
  private boolean isStart;
}
