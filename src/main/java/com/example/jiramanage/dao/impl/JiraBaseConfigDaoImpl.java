
package com.example.jiramanage.dao.impl;

import com.example.jiramanage.dao.JiraBaseConfigDAO;
import com.example.jiramanage.model.JiraBaseConfig;
import com.example.jiramanage.model.JiraInstance;
import java.util.List;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class JiraBaseConfigDaoImpl implements JiraBaseConfigDAO {

  @Autowired
  private EntityManager entityManager;

  @Override
  public List<JiraBaseConfig> get() {
    Session currSession = entityManager.unwrap(Session.class);
    Query<JiraBaseConfig> query = currSession.createQuery("from JiraBaseConfig", JiraBaseConfig.class);
    List<JiraBaseConfig> list = query.getResultList();
    return list;
  }

  @Override
  public JiraBaseConfig get(long id) {
    Session currSession = entityManager.unwrap(Session.class);
    JiraBaseConfig jiraBaseConfig = currSession.get(JiraBaseConfig.class, id);
    return jiraBaseConfig;
  }

  @Override
  @Transactional
  public void save(JiraBaseConfig jiraBaseConfig) {
    Session currSession = entityManager.unwrap(Session.class);
    currSession.saveOrUpdate(jiraBaseConfig);
  }

  @Override
  public void delete(int id) {
    Session currSession = entityManager.unwrap(Session.class);
    JiraBaseConfig jiraBaseConfig = currSession.get(JiraBaseConfig.class, id);
    currSession.delete(jiraBaseConfig);
  }
}
