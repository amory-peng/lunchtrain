import PassengerList from './passenger_list';
import Poll from './poll';
import { MESSAGE_PREFIX } from './config';

export default class LunchTrain {
  constructor(message) {
    this.client = message.client;
    this.channel = message.channel;
    this.conductor = message.author;

    this.state = {
      close: false,
      notes: []
    };

    this.passengerList = new PassengerList(this.channel);
    this.poll = new Poll(this.channel);
    this.listenCb = msg => this.listen(msg);
  }

  hasLeft() {
    return this.state.close;
  }

  listen(message) {
    if (
      message.channel.id !== this.channel.id
      || message.content.substring(0, MESSAGE_PREFIX.length) !== MESSAGE_PREFIX
      || this.state.close
    ) {
      return null;
    }
    const splitIdx = message.content.indexOf(' ');
    const command = message.content.slice(
      MESSAGE_PREFIX.length,
      splitIdx > -1 ? splitIdx : undefined
    );
    console.log(
      `${message.createdAt} ${message.channel} ${message.author.tag}: ${
        message.content
      }`
    );
    const args = splitIdx > -1 ? message.content.slice(splitIdx + 1) : '';
    let driver;
    switch (command) {
      case 'join':
        this.passengerList.add(message.author);
        break;
      case 'leave':
        this.passengerList.remove(message.author);
        break;
      case 'driving':
        this.passengerList.addDriver(message.author);
        break;
      case 'notdriving':
        this.passengerList.removeDriver(message.author);
        break;
      case 'getride':
        driver = this.getUser(args);
        this.passengerList.addParasite(driver, message.author);
        break;
      case 'noride':
        this.passengerList.removeParasite(message.author);
        break;
      case 'print':
        this.passengerList.list();
        this.printNotes();
        break;
      case 'help':
        this.help();
        break;
      case 'poll':
        this.poll.parse(args, message.author, this.validate(message.author));
        break;
      case 'note':
        this.addNote(args);
        break;
      case 'depart':
        this.depart();
        break;
      default:
        // do nothing
        break;
    }
    return true;
  }

  start() {
    this.channel.send(
      `:train: @here CHOO CHOO ${
        this.conductor
      } has started a lunch train CHOO CHOO :train:\n`
    );

    this.passengerList.add(this.conductor, false);
    this.client.on('message', this.listenCb);
  }

  validate(author) {
    if (!this.passengerList.includes(author)) {
      this.channel.send(`Naughty boi ${author} not on the train`);
      return false;
    }
    return true;
  }

  getUser(username) {
    const user = Array.from(this.client.users.values()).find(
      u => u.username === username
    );
    return user || this.channel.send(`${username} is not a user.`);
  }

  addNote(note) {
    this.state.notes.push(note);
    this.printNotes();
  }

  printNotes() {
    let msg = 'Notes:\n';
    msg += this.state.notes.join('\n');
    this.channel.send(msg);
  }

  help() {
    const commands = [];
    commands.push('driving: volunteer self as driver');
    commands.push('notdriving: remove self from driver pool');
    commands.push('getride {driver name}: get ride from a driver');
    commands.push('noride: remove self from driving');
    commands.push('join: Join lunch train');
    commands.push('leave: Leave lunch train');
    commands.push('note: Add a note');
    commands.push('poll: Start a food poll (!poll help for options)');
    commands.push('print: List current passengers');
    this.channel.send(
      commands.map(cmd => `${MESSAGE_PREFIX}${cmd}`).join('\n')
    );
  }

  depart() {
    this.state.close = true;
    this.client.removeListener('message', this.listenCb);
    this.poll.close();
    this.channel.send(
      ':train: CHOO CHOO @here lunch train departing CHOO CHOO :train:'
    );
  }
}
