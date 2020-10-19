package com.example.jiramanage.service.impl;

import com.example.jiramanage.bean.BaseConfigBean;
import com.example.jiramanage.dao.JiraBaseConfigDAO;
import com.example.jiramanage.enums.ConfigType;
import com.example.jiramanage.exception.ConfigTypeException;
import com.example.jiramanage.model.JiraBaseConfig;
import com.example.jiramanage.service.JiraBaseConfigService;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JiraBaseConfigServiceImpl implements JiraBaseConfigService {

  @Autowired
  JiraBaseConfigDAO jiraBaseConfigDAO;

  @Override
  public List<JiraBaseConfig> get() {
    return jiraBaseConfigDAO.get();
  }

  @Override
  public Optional<JiraBaseConfig> get(long id) {
    return Optional.ofNullable(jiraBaseConfigDAO.get(id));
  }

  @Override
  public void save(JiraBaseConfig jiraBaseConfig) {
    jiraBaseConfigDAO.save(jiraBaseConfig);
  }

  @Override
  public void delete(int id) {
    jiraBaseConfigDAO.delete(id);
  }

  @Override
  public List<JiraBaseConfig> getOnCreateConfig() {
    return jiraBaseConfigDAO.get().parallelStream().filter(
        jiraBaseConfig -> jiraBaseConfig.getConfigType()
            .equals(ConfigType.ON_CREATE_JIRA.toString())).collect(Collectors.toList());
  }

  @Override
  public List<JiraBaseConfig> getConfigOnDelete() {
    return jiraBaseConfigDAO.get().parallelStream().filter(
        jiraBaseConfig -> jiraBaseConfig.getConfigType()
            .equals(ConfigType.ON_DELETE_TMP_FILES.getName())).collect(Collectors.toList());
  }

  @Override
  public void addConfig(BaseConfigBean baseConfigBean) throws ConfigTypeException {
    Optional<ConfigType> configTypeOP = ConfigType.getByName(baseConfigBean.getConfigType());
    if (!configTypeOP.isPresent()) {
      throw new ConfigTypeException("The config type does not exist");
    }
    JiraBaseConfig jiraBaseConfig = new JiraBaseConfig(configTypeOP.get().toString(),
        baseConfigBean.getConfig(), baseConfigBean.getName());
    this.save(jiraBaseConfig);
  }
}
