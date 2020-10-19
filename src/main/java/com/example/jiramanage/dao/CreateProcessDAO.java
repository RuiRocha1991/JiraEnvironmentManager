package com.example.jiramanage.dao;

import com.example.jiramanage.model.CreateProcess;
import java.util.List;

public interface CreateProcessDAO {

  List<CreateProcess> get();

  CreateProcess get(long id);

  void save(CreateProcess createProcess);

  void delete(int id);

}
