package com.example.jiramanage.bean;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class JiraDownloadBean {

  private String zipURL;
  private String description;
  private String version;
  private String platform;
  private LocalDate released;
  private String size;
}
