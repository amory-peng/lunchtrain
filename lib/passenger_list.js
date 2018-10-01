export default class PassengerList {
  constructor(channel) {
    this.channel = channel;
    this.state = { passengers: new Set() };
  }

  add(user) {
    this.state.passengers.add(user);
    this.channel.send(`${user} has joined the lunch train!`);
  }

  remove(user) {
    this.state.passengers.delete(user);
    this.channel.send(`${user} has left the lunch train!`);
  }

  list() {
    let msg = '';
    const list = Array.from(this.state.passengers);
    if (list.length === 0) {
      msg = 'Empty train :feelsbadman:';
    } else {
      msg = `Current members: ${Array.from(this.state.passengers).join(' ')}`;
    }
    this.channel.send(msg);
  }
}
