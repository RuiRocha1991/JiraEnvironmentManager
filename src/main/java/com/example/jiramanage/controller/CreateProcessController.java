package com.example.jiramanage.controller;

import com.example.jiramanage.bean.MessageBean;
import com.example.jiramanage.enums.ProgressStatus;
import com.example.jiramanage.model.CreateProcess;
import com.example.jiramanage.service.CreateProcessService;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CreateProcessController {

  @Autowired
  private CreateProcessService createProcessService;

  @GetMapping("/process/{id}")
  public MessageBean get(@PathVariable int id) {
    Optional<CreateProcess> createProcess = createProcessService.get(id);
    if (createProcess.isPresent()) {
      if (createProcess.get().getStatus().equals(ProgressStatus.CANCELED.name())) {
        return MessageBean.builder().statusCode(200).message(createProcess.get().getError())
            .title("Error").isSuccess(false).build();
      }
      return MessageBean.builder().statusCode(200).message("Success").title("Success")
          .isSuccess(true).data(createProcess.get()).build();
    }
    return MessageBean.builder().statusCode(200).message("Error")
        .title("Process not found: ".concat(String.valueOf(id))).isSuccess(true).build();
  }

}
