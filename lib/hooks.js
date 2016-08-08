const messageFormat = /^#\d+\s[A-Z].*/

class Hooks {

  push(event) {
    const offendingCommits = event.commits
      .filter(commit => !commit.message.match(messageFormat))
      .map(commit => {
        return `${commit.author.name} [${commit.id} on ${event.repository.full_name}]: ${commit.message}`;
      });
    offendingCommits.forEach(offence => console.log(offence));
  }

};

module.exports = new Hooks();
