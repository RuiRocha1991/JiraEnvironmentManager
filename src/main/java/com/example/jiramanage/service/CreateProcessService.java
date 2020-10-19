package com.example.jiramanage.service;

import com.example.jiramanage.bean.CreateJiraInstanceBean;
import com.example.jiramanage.model.CreateProcess;
import java.util.Optional;

public interface CreateProcessService {

  void save(CreateProcess createProcess);

  void process(CreateJiraInstanceBean createJiraInstanceBean);

  Optional<CreateProcess> get(long id);

}
