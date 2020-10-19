package com.example.jiramanage.dao.impl;

import com.example.jiramanage.dao.JiraInstanceDAO;
import com.example.jiramanage.model.JiraInstance;
import java.util.List;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class JiraInstanceDaoImpl implements JiraInstanceDAO {

  @Autowired
  private EntityManager entityManager;

  @Override
  public List<JiraInstance> get() {
    Session currSession = entityManager.unwrap(Session.class);
    Query<JiraInstance> query = currSession.createQuery("from JiraInstance", JiraInstance.class);
    List<JiraInstance> list = query.getResultList();
    return list;
  }

  @Override
  public JiraInstance get(long id) {
    Session currSession = entityManager.unwrap(Session.class);
    JiraInstance jiraInstance = currSession.get(JiraInstance.class, id);
    return jiraInstance;
  }

  @Override
  @Transactional
  public void save(JiraInstance jiraInstance) {
    Session currSession = entityManager.unwrap(Session.class);
    currSession.saveOrUpdate(jiraInstance);
  }

  @Override
  public void delete(long id) {
    Session currSession = entityManager.unwrap(Session.class);
    JiraInstance jiraInstance = currSession.get(JiraInstance.class, id);
    currSession.delete(jiraInstance);
  }

  @Override
  public Optional<JiraInstance> getByName(String name) {
    Session currSession = entityManager.unwrap(Session.class);
    Optional<JiraInstance> opJiraInstance = Optional
        .ofNullable(currSession.get(JiraInstance.class, name));
    return opJiraInstance;
  }
}
