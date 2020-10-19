package com.example.jiramanage.service;

import com.example.jiramanage.bean.CreateJiraInstanceBean;
import com.example.jiramanage.bean.InstancePath;
import com.example.jiramanage.bean.JiraDownloadBean;
import com.example.jiramanage.bean.JiraInstanceBean;
import com.example.jiramanage.bean.StartStopJiraBean;
import com.example.jiramanage.enums.OrderUtils;
import com.example.jiramanage.enums.SortUtils;
import com.example.jiramanage.exception.DeleteFileException;
import com.example.jiramanage.exception.DirectoryExistsException;
import com.example.jiramanage.exception.NameAlreadyExistsException;
import com.example.jiramanage.model.JiraInstance;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.json.JSONException;
import org.json.JSONObject;

public interface JiraInstanceService {

  List<JiraInstance> get();

  Optional<JiraInstance> get(long id);

  void add(JiraInstance jiraInstance) throws NameAlreadyExistsException, DirectoryExistsException;

  void save(JiraInstance jiraInstance);

  void delete(long id);

  int addJiraInstancesBulk(InstancePath instancePath);

  JiraInstanceBean convertJiraInstanceToBean(JiraInstance jiraInstance);

  List<JiraInstanceBean> getJiraInstancesSorted(SortUtils sortBy, OrderUtils order);

  String startAndStopJira(StartStopJiraBean startStopJiraBean) throws Exception;

  Map<String,Map<String, List<JiraDownloadBean>>> getAllJiraVersions() throws IOException, JSONException;

  String createJiraInstanceProcess(CreateJiraInstanceBean createJiraInstanceBean)
      throws NameAlreadyExistsException, DirectoryExistsException, JSONException;

  String deleteTempFilesOnServer(long id) throws DeleteFileException;

  String deleteTempFilesOnHome(long id) throws DeleteFileException;
}
