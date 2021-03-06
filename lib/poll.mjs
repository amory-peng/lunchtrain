import { MESSAGE_PREFIX } from './config';
import { DEFAULT_POLL_OPTIONS } from './config';

const POLL_COMMAND = `${MESSAGE_PREFIX}poll`;

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

  parse(args, author = null, validated = false) {
    const opts = args.split(',').map(str => str.trim());
    const command = opts[0] ? opts[0].split(/\s/)[0] : null;
    switch (command) {
      case 'help':
        return this.help();
      case 'print':
        return this.print();
      case 'vote':
        if (!validated) return null;
        return this.vote(opts, author);
      case 'unvote':
        if (!validated) return null;
        return this.unvote(opts, author);
      case 'add':
        if (!validated) return null;
        return this.add(parseOpts(opts.join()), author);
      case 'close':
        if (!validated) return null;
        return this.close();
      case 'start':
        if (!validated) return null;
        opts[0] = parseOpts(opts[0]);
        return this.start(opts.filter(n => n));
      default:
        return this.print();
    }
  }

  help() {
    let msg = `Call \`${POLL_COMMAND} start {options}\` with options in a comma delineated list.\n`;
    msg += 'Leave empty for default options\n';
    msg += `Ex) !${POLL_COMMAND} din ding, pizza, viet \n\n`;
    msg += 'Other options:\n';
    msg += `\`${POLL_COMMAND} help\`:  (prints this message :wave:)\n`;
    msg += `\`${POLL_COMMAND} print\`: print out current poll (if any)\n`;
    msg += `\`${POLL_COMMAND} close\`: close out current poll (if any)\n`;
    msg += `\`${POLL_COMMAND} vote {num}\`: vote for an option \n`;
    msg += `\`${POLL_COMMAND} unvote {num}\`: retract a vote for an option \n`;
    msg += `\`${POLL_COMMAND} add {option}\`: add an option to the poll\n `;
    this.channel.send(msg);
  }

  start(opts) {
    if (!this.state.open) {
      // clear out votes and options
      this.state.votes = {};
      this.state.options = !opts || opts.length === 0 ? DEFAULT_POLL_OPTIONS : opts;
      // adding collections
      this.state.options.forEach(opt => (this.state.votes[opt] = new Set()));
      this.state.open = true;
      this.print();
    } else {
      this.channel.send(
        `Poll already exists. Type \`${POLL_COMMAND} print\` for options.`
      );
    }
  }

  print() {
    let msg = this.state.options.length === 0 || !this.state.open
      ? 'Poll is currently closed.\n'
      : `How to vote: \`${POLL_COMMAND} vote {num}\`\n`;
    this.state.options.forEach((opt, idx) => {
      const userArray = Array.from(this.state.votes[opt]);
      msg += `${idx}. ${opt} (${userArray.length}): ${Array.from(
        this.state.votes[opt]
      )
        .map(u => u.username)
        .join(' ')}\n`;
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
      this.channel.send(`${author} voted for ${option} \n`);
    }
    this.print();
  }

  unvote(content, author) {
    const option = this.getOptionFromVote(content, author);
    if (!option) return;
    if (this.state.votes[option].delete(author)) {
      this.channel.send(`${author} retracted vote for ${option} \n`);
    }
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
