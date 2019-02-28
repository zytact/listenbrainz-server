import {getArtistLink, getPlayButton, getTrackLink} from './utils.jsx';

import React from 'react';

export class FollowUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: props.followList || [],
      saveUrl: props.saveUrl || "https://listenbrainz.org/follow/save",
      listId: props.listId,
      listName: props.listName,
    }
    this.addUserToList = this.addUserToList.bind(this);
    this.reorderUser = this.reorderUser.bind(this);
  }

  addUserToList(event) {
    event.preventDefault();
    if (this.textInput.value === "" ||
      this.state.users.find(user => user === this.textInput.value))
    {
      return;
    }
    this.setState(prevState => {
      return { users: prevState.users.concat([this.textInput.value]) }
    }, () => {
      this.textInput.value = "";
      this.props.onUserListChange(this.state.users);
    });
  }

  removeUserFromList(index) {
    this.setState(prevState => {
      prevState.users.splice(index, 1);
      return { users: prevState.users }
    }, () => { this.props.onUserListChange(this.state.users) });
  }

  reorderUser(currentIndex, targetIndex) {
    this.setState(prevState => {
      var element = prevState.users[currentIndex];
      prevState.users.splice(currentIndex, 1);
      prevState.users.splice(targetIndex, 0, element);
      return { users: prevState.users }
    });
  }

  saveFollowList(event) {
    var listName = this.state.listName;
    if (this.nameInput.value != undefined && this.nameInput.value != "") {
      listName = this.nameInput.value;
    }
    fetch(this.state.saveUrl, {
      method: "POST",
      body: JSON.stringify({
        "users": this.state.users,
        "name": listName,
        "id": this.state.listId,
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.debug(data);
      console.debug("old List ID: " + this.state.listId);
      this.setState(prevState => {
        return {listId: data.list_id};
      });
      console.debug("new List ID: " + this.state.listId);
    })
  }

  newFollowList(event) {
    this.setState(prevState => {
      return {
        users: [],
        listId: null,
     };
    });
    this.nameInput.value = "Untitled Follow List";
  }

  render() {
    const noTopBottomPadding = {
      paddingTop: 0,
      paddingBottom: 0
    };
    return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <i className="fas fa-sitemap fa-2x fa-flip-vertical"></i>
          <span style={{fontSize: "x-large", marginLeft: "0.55em", verticalAign: "middle" }}>
            Follow users
          </span>
          <input type="text" placeholder={this.props.listName} style={{"float": "right"}}
              ref={(input) => this.nameInput = input} />


        </div>
        <div className="panel-body">
          <div className="input-group">
            <span className="text-muted">
              Add a user to discover what they are listening to:
            </span>
            <span className="input-group-btn btn-primary">
              <button className="btn btn-primary" type="button" onClick={this.newFollowList.bind(this)}>
                <span className="fa fa-plus" aria-hidden="true"></span> New List
              </button>
            </span>
            <div style={{"width": "1px", "height": "100%"}}/>
            <span className="input-group-btn btn-primary">
              <button className="btn btn-primary" type="button" onClick={this.saveFollowList.bind(this)}>
                <span className="fa fa-save" aria-hidden="true"></span> Save
              </button>
            </span>

          </div>
          <hr />
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Username…"
              ref={(input) => this.textInput = input}
            />
            <span className="input-group-btn btn-primary">
              <button className="btn btn-primary" type="button" onClick={this.addUserToList}>
                <span className="fa fa-plus-circle" aria-hidden="true"></span> Add
              </button>
            </span>
          </div>
          <table className="table table-condensed table-striped listens-table">
            <thead>
              <tr>
                <th colSpan="2" width="50px">Order</th>
                <th>User</th>
                <th>Listening now</th>
                <th width="50px"></th>
                <th width="65px"></th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map((user, index) => {
                return (
                  <tr key={user} className={this.props.playingNow[user] && "playing_now"} onDoubleClick={this.props.playListen.bind(this, this.props.playingNow[user])}>
                    <td>
                      {index + 1}
                    </td>
                    <td>
                      <span className="btn-group btn-group-xs" role="group" aria-label="Reorder">
                        {index > 0 &&
                          <button className="btn btn-info"
                            onClick={this.reorderUser.bind(this, index, index - 1)}>
                            <span className="fa fa-chevron-up"></span>
                          </button>
                        }
                        {index < this.state.users.length - 1 &&
                          <button className="btn btn-info"
                            onClick={this.reorderUser.bind(this, index, index + 1)}>
                            <span className="fa fa-chevron-down"></span>
                          </button>
                        }
                      </span>
                    </td>
                    <td>
                      {user}
                    </td>
                    <td>
                      {this.props.playingNow[user] &&
                        <React.Fragment>
                          {getTrackLink(this.props.playingNow[user])}
                          <span className="small"> — {getArtistLink(this.props.playingNow[user])}</span>
                        </React.Fragment>
                      }
                    </td>
                    <td className="playButton">
                      {this.props.playingNow[user] &&
                        getPlayButton(this.props.playingNow[user], this.props.playListen.bind(this, this.props.playingNow[user]))
                      }
                    </td>
                    <td style={noTopBottomPadding}>
                      <button className="btn btn-danger" type="button" aria-label="Remove"
                        onClick={this.removeUserFromList.bind(this, index)}>
                        <span className="fa fa-trash-alt"></span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}
