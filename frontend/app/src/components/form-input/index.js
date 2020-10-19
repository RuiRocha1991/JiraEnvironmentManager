import React from "react";
import {Form} from "react-bootstrap";

const FormInputText = ({controlId, label, hasHandleChange, handleChange, name, placeHolder, text, hasText, value}) => {
  return (
      <Form.Group controlId={controlId}>
        <Form.Label>{label}</Form.Label>
        <Form.Control onChange={hasHandleChange ? handleChange : null} type="text"
                      name={name} placeholder={placeHolder} value={value}/>
        {hasText && <Form.Text className="text-muted">
          Full path: {text}
        </Form.Text>}
      </Form.Group>

  )
}

export default FormInputText;