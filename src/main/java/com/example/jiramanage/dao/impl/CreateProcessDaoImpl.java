package com.example.jiramanage.dao.impl;

import com.example.jiramanage.dao.CreateProcessDAO;
import com.example.jiramanage.model.CreateProcess;
import java.util.List;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class CreateProcessDaoImpl implements CreateProcessDAO {

  @Autowired
  private EntityManager entityManager;

  @Override
  public List<CreateProcess> get() {
    Session currSession = entityManager.unwrap(Session.class);
    Query<CreateProcess> query = currSession.createQuery("from Process", CreateProcess.class);
    return query.getResultList();
  }

  @Override
  @Transactional
  public CreateProcess get(long id) {
    Session currSession = entityManager.unwrap(Session.class);
    return currSession.get(CreateProcess.class, id);
  }

  @Override
  @Transactional
  public void save(CreateProcess createProcess) {
    Session currSession = entityManager.unwrap(Session.class);
    currSession.saveOrUpdate(createProcess);
  }

  @Override
  public void delete(int id) {
    Session currSession = entityManager.unwrap(Session.class);
    CreateProcess createProcess = currSession.get(CreateProcess.class, id);
    currSession.delete(createProcess);
  }
}
