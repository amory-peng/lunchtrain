import { remove } from 'lodash';
import { DEFAULT_POLL_OPTIONS } from './config';

const parseOpts = str => str
  .split(/\s/)
  .slice(1)
  .join(' ')
  .trim();

export default class Poll {
  constructor(channel) {
    this.channel = channel;
    this.state = {
      open: false,
      votes: {},
      options: [],
      result: null
    };
  }

  parse(args, author = null) {
    console.log(args);
    const opts = args.split(',').map(str => str.trim());
    const command = opts[0] ? opts[0].split(/\s/)[0] : null;
    switch (command) {
      case 'help':
        return this.help();
      case 'print':
        return this.print();
      case 'vote':
        return this.vote(opts, author);
      case 'unvote':
        return this.unvote(opts, author);
      case 'add':
        return this.add(parseOpts(opts.join()), author);
      case 'close':
        return this.close();
      case 'start':
        opts[0] = parseOpts(opts[0]);
        return this.start(opts.filter(n => n));
      default:
        return this.help();
    }
  }

  help() {
    let msg = 'Call !poll with up to 5 options in a comma delineated list.\n';
    msg += 'Leave empty for default options\n';
    msg += 'Ex) !poll din ding, pizza, viet \n\n';
    msg += 'Other options:\n';
    msg += '!poll help:  (prints this message :wave:)\n';
    msg += '!poll print: print out current poll (if any)\n';
    msg += '!poll close: close out current poll (if any)\n';
    msg += '!poll vote {num}: vote for an option \n';
    msg += '!poll unvote {num}: retract a vote for an option \n';
    msg += '!poll add {option}: add an option to the poll\n ';
    this.channel.send(msg);
  }

  start(opts) {
    if (!this.state.open) {
      // clear out votes and options
      this.state.votes = {};
      console.log(opts);
      this.state.options = !opts || opts.length === 0 ? DEFAULT_POLL_OPTIONS : opts;
      // adding collections
      this.state.options.forEach(opt => (this.state.votes[opt] = new Set()));
      this.state.open = true;
      this.print();
    } else {
      this.channel.send('Poll already exists. Type `!poll print` for options.');
    }
  }

  print() {
    let msg = this.state.options.length === 0 || !this.state.open
      ? 'Poll is currently closed.\n'
      : 'How to vote: `!vote {num}`\n';
    this.state.options.forEach((opt, idx) => {
      msg += `${idx}. ${opt} ${Array.from(this.state.votes[opt])}\n`;
    });
    this.channel.send(msg);
  }

  getOptionFromVote(content, author) {
    if (!this.state.open || this.state.options.length === 0) {
      this.channel.send('Poll is currently closed.');
      return false;
    }
    const option = this.state.options[parseInt(content[0].split(/\s/)[1], 10)];
    if (!option) {
      this.channel.send(`${author}: Invalid option ${content}`);
      return false;
    }

    return option;
  }

  vote(content, author) {
    const option = this.getOptionFromVote(content, author);
    if (!option) return;

    if (!this.state.votes[option].has(author)) {
      this.state.votes[option].add(author);
    }
    this.channel.send(`${author} voted for ${option} \n`);
    this.print();
  }

  unvote(content, author) {
    const option = this.getOptionFromVote(content, author);
    if (!option) return;
    if (this.state.votes[option].has(author)) {
      this.state.votes[option].delete(author);
    }
    this.channel.send(`${author} retracted vote for ${option} \n`);
    this.print();
  }

  close() {
    this.state.open = false;
    this.channel.send('Poll closed!');
  }

  add(content, author) {
    if (this.state.options.includes(content)) {
      return this.channel.send('Option already exists');
    }
    this.state.options.push(content);
    this.state.votes[content] = new Set();
    if (author) this.state.votes[content].add(author);
    return this.print();
  }
}
