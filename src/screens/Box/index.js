import React, { Component } from "react";
import { MdInsertDriveFile } from "react-icons/md";
import { formatDistance } from "date-fns";
import pt from "date-fns/locale/pt-BR";
import Dropzone from "react-dropzone";
import socket from "socket.io-client";

import "./styles.css";
import logo from "../../assets/logo.svg";
import api from "../../services/api";

export default class Box extends Component {
  state = {
    box: {}
  };

  async componentDidMount() {
    this.subscribeToNewFiles();
    const { id } = this.props.match.params;
    const response = await api.get(`/boxes/${id}`);

    if (!response.data) return;

    this.setState({ box: response.data });
  }

  subscribeToNewFiles = () => {
    const { id } = this.props.match.params;
    const io = socket("http://localhost:3300");

    io.emit("connectRoom", id);

    io.on("file", data => {
      this.setState({
        box: { ...this.state.box, files: [data, ...this.state.box.files] }
      });
    });
  };

  handleUpload = files => {
    files.forEach(file => {
      const data = new FormData();
      const { id } = this.props.match.params;

      data.append("file", file);

      api.post(`/boxes/${id}/files`, data);
    });
  };

  render() {
    const { title, files } = this.state.box;
    return (
      <div id="box-container">
        <header>
          <img src={logo} alt="Rocket Box" />
          <h1>{title}</h1>
        </header>
        <Dropzone onDropAccepted={this.handleUpload}>
          {({ getRootProps, getInputProps }) => (
            <div className="upload" {...getRootProps()}>
              <input {...getInputProps()} />

              <p>Arraste arquivos ou clique aqui.</p>
            </div>
          )}
        </Dropzone>
        <ul>
          {files &&
            files.map(({ title, url, _id, createdAt }) => (
              <li key={_id}>
                <a href={url} alt={title} className="fileInfo" target="_blank">
                  <MdInsertDriveFile size={24} color="#A5CFFF" />
                  <strong>{title}</strong>
                </a>
                <span>
                  há{" "}
                  {formatDistance(new Date(createdAt), new Date(), {
                    locale: pt
                  })}
                </span>
              </li>
            ))}
        </ul>
      </div>
    );
  }
}
