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
      location: '',
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
    switch (command) {
      case 'join':
        this.passengerList.add(message.author);
        break;
      case 'leave':
        this.passengerList.remove(message.author);
        break;
      case 'list':
        this.passengerList.list();
        break;
      case 'help':
        this.help();
        break;
      case 'poll':
        this.poll.parse(args, message.author, this.validate(message.author));
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

  help() {
    const commands = [];
    commands.push('join: Join lunch train');
    commands.push('leave: Leave lunch train');
    commands.push('list: List current passengers');
    commands.push('poll: Start a food poll (!poll help for options)');
    commands.push('depart: Close out train');
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
