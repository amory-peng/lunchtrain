export default class PassengerList {
  constructor(channel) {
    this.channel = channel;
    this.passengers = new Set();
    this.taxi = {};
    this.parasites = {};
  }

  add(user, alert = true) {
    this.passengers.add(user);
    if (alert) this.channel.send(`${user} has joined the lunch train.`);
  }

  addDriver(driver) {
    this.taxi[driver.tag] = new Set();
    console.log(this.taxi);
    this.add(driver);
    this.channel.send(`${driver} is driving.`);
  }

  removeDriver(driver) {
    if (!this.taxi[driver.tag]) return;
    Array.from(this.taxi[driver.tag]).forEach((parasite) => {
      delete this.parasites[parasite.tag];
    });
    delete this.taxi[driver.tag];
    this.channel.send(`${driver} is not driving any more.`);
  }

  addParasite(driver, parasite) {
    if (!driver || !this.taxi[driver.tag]) return this.channel.send(`${driver.tag} not available`);
    const host = this.parasites[parasite.tag];
    if (host) this.channel.send(`${host} no longer picking up ${parasite}`);
    if (this.taxi[parasite.tag]) {
      delete this.taxi[parasite.tag];
      this.channel.send(`${parasite} no longer driving`);
    }
    if (!driver || !this.taxi[driver.tag]) return this.channel.send(`${driver.tag} not available`);
    this.taxi[driver.tag].add(parasite);
    this.parasites[parasite.tag] = driver;
    return this.channel.send(`${driver} is picking up ${parasite}`);
  }

  removeParasite(parasite) {
    if (!this.parasites[parasite.tag]) return;
    const driver = this.parasites[parasite.tag];
    if (this.taxi[driver.tag].delete(parasite)) {
      delete this.parasites[parasite.tag];
      this.channel.send(`${driver} no longer picking up ${parasite}`);
    }
  }

  remove(user) {
    this.passengers.delete(user);
    this.removeParasite(user);
    this.removeDriver(user);
    this.channel.send(`${user} has left the lunch train.`);
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
      msg = `Current members: ${list.map(u => u.username).join(' ')} \n`;
      msg += 'Current drivers:\n';
      Object.keys(this.taxi).forEach((driverTag) => {
        const parasites = Array.from(this.taxi[driverTag]);
        let submsg = `${driverTag}`;
        if (parasites.length > 0) {
          submsg += ` picking up ${Array.from(this.taxi[driverTag]).join(
            ' '
          )} \n`;
        }
        msg += submsg;
      });
    }
    this.channel.send(msg);
  }
}
