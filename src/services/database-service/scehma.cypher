// src/services/database-service/schema.cypher

// User Node
CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE;
CREATE INDEX ON :User(username);

// Word Node
CREATE CONSTRAINT ON (w:Word) ASSERT w.keyword IS UNIQUE;
CREATE INDEX ON :Word(keyword);

// Belief Node
CREATE CONSTRAINT ON (b:Belief) ASSERT b.id IS UNIQUE;
CREATE INDEX ON :Belief(id);

// Evidence Node
CREATE CONSTRAINT ON (e:Evidence) ASSERT e.id IS UNIQUE;
CREATE INDEX ON :Evidence(id);

// Definition Node
CREATE CONSTRAINT ON (d:Definition) ASSERT d.id IS UNIQUE;
CREATE INDEX ON :Definition(id);

// Comment Node (for discussion threads)
CREATE CONSTRAINT ON (c:Comment) ASSERT c.id IS UNIQUE;
CREATE INDEX ON :Comment(id);

// User Node Structure
CREATE (u:User {
  id: "user123",
  username: "exampleUser",
  missionStatement: "To explore and learn",
  createdAt: datetime(),
  lastActive: datetime()
})

// Word Node Structure
CREATE (w:Word {
  keyword: "example",
  liveDefinitionUpvotes: 0
})

// Belief Node Structure
CREATE (b:Belief {
  id: "belief123",
  statement: "This is a belief statement",
  agreeVotes: 0,
  disagreeVotes: 0,
  createdAt: datetime()
})

// Evidence Node Structure
CREATE (e:Evidence {
  id: "evidence123",
  content: "This is evidence supporting a belief",
  agreeVotes: 0,
  disagreeVotes: 0,
  createdAt: datetime()
})

// Relationships
// User creates a Belief
MATCH (u:User {id: "user123"}), (b:Belief {id: "belief123"})
CREATE (u)-[:CREATED]->(b)

// User interacts with a Belief
MATCH (u:User {id: "user123"}), (b:Belief {id: "belief123"})
CREATE (u)-[:INTERACTED_WITH {type: "voted"}]->(b)

// User preference for a node
MATCH (u:User {id: "user123"}), (b:Belief {id: "belief123"})
CREATE (u)-[:PREFERS {visibility: "show"}]->(b)

// Word associated with a Belief
MATCH (w:Word {keyword: "example"}), (b:Belief {id: "belief123"})
CREATE (b)-[:HAS_KEYWORD {frequency: 1}]->(w)

// Definition for a Word
CREATE (d:Definition {id: "def123", content: "This is a definition", upvotes: 0})
MATCH (w:Word {keyword: "example"}), (d:Definition {id: "def123"})
CREATE (w)-[:HAS_DEFINITION {isLive: true}]->(d)

// Evidence supports a Belief
MATCH (e:Evidence {id: "evidence123"}), (b:Belief {id: "belief123"})
CREATE (e)-[:SUPPORTS]->(b)

// Comment on a Belief
CREATE (c:Comment {id: "comment123", content: "This is a comment", createdAt: datetime()})
MATCH (c:Comment {id: "comment123"}), (b:Belief {id: "belief123"})
CREATE (c)-[:COMMENTS_ON]->(b)

// User votes on a Belief
MATCH (u:User {id: "user123"}), (b:Belief {id: "belief123"})
CREATE (u)-[:VOTED_ON {type: "agree", value: 1}]->(b)