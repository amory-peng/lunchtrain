export default class PassengerList {
  constructor(channel) {
    this.channel = channel;
    this.passengers = new Set();
  }

  add(user, alert = true) {
    this.passengers.add(user);
    if (alert) this.channel.send(`${user} has joined the lunch train!`);
  }

  remove(user) {
    this.passengers.delete(user);
    this.channel.send(`${user} has left the lunch train!`);
  }

  includes(user) {
    return this.passengers.has(user);
  }

  list() {
    let msg = '';
    const list = Array.from(this.passengers);
    if (list.length === 0) {
      msg = 'Empty train :feelsbadman:';
    } else {
      msg = `Current members: ${list.map(u => u.username).join(' ')}`;
    }
    this.channel.send(msg);
  }
}
