package com.example.jiramanage.dao;

import com.example.jiramanage.model.JiraBaseConfig;
import java.util.List;

public interface JiraBaseConfigDAO {

  List<JiraBaseConfig> get();

  JiraBaseConfig get(long id);

  void save(JiraBaseConfig JiraBaseConfig);

  void delete(int id);


}
