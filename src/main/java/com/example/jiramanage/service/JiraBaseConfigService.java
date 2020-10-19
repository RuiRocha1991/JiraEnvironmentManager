package com.example.jiramanage.service;

import com.example.jiramanage.bean.BaseConfigBean;
import com.example.jiramanage.exception.ConfigTypeException;
import com.example.jiramanage.model.JiraBaseConfig;
import java.util.List;
import java.util.Optional;

public interface JiraBaseConfigService {

  List<JiraBaseConfig> get();

  Optional<JiraBaseConfig> get(long id);

  void save(JiraBaseConfig jiraBaseConfig);

  void delete(int id);

  List<JiraBaseConfig> getOnCreateConfig();

  List<JiraBaseConfig> getConfigOnDelete();

  void addConfig(BaseConfigBean baseConfigBean) throws ConfigTypeException;
}
