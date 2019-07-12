import React, { Component } from "react";
import Joke from "./Joke";
import axios from "axios";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = { numJokesToGet: 10 };

  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.id));
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
    else this.setState(st => ({ jokes: [...st.jokes].sort((a, b) => b.votes - a.votes) }));
  }

  async getJokes() {
    try {
      const jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        const res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } });
        const [newJoke, jokeId] = [res.data.joke, res.data.joke];
        if (!this.seenJokes.has(jokeId)) {
          jokes.push({ id: jokeId, text: newJoke, votes: 0 });
          this.seenJokes.add(jokeId);
        } else {
          console.log("Duplicate Joke: " + newJoke);
        }
      }
      this.setState(st => {
        const sortedJokes = [...st.jokes, ...jokes].sort((a, b) => b.votes - a.votes);
        return { loading: false,  jokes: sortedJokes };
      }, () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(st => ({
        jokes: st.jokes.map(j => j.id === id ? { ...j, votes: j.votes + delta } : j)
      }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
  }

  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className='JokeList-spinner'>
          <i className='far fa-8x fa-laugh fa-spin' />
          <h1 className='JokeList-title'>Loading...</h1>
        </div>
      );
    }
    return (
      <div className='JokeList'>
        <div className='JokeList-sidebar'>
          <h1 className='JokeList-title'>
            <span>Dad</span> Jokes
          </h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt="Smiley Face pic"/>
          <button className='JokeList-getmore' onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>

        <div className='JokeList-jokes'>
          {this.state.jokes.map(j => (
            <Joke
              key={j.id}
              votes={j.votes}
              text={j.text}
              upvote={() => this.handleVote(j.id, 1)}
              downvote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}
export default JokeList;
