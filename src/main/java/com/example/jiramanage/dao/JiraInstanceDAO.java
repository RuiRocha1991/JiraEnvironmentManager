
package com.example.jiramanage.dao;

import com.example.jiramanage.model.JiraInstance;
import java.util.List;
import java.util.Optional;

public interface JiraInstanceDAO {

  List<JiraInstance> get();

  JiraInstance get(long id);

  void save(JiraInstance jiraInstance);

  void delete(long id);

  Optional<JiraInstance> getByName(String name);
}

