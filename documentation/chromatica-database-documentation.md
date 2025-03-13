# **Chromatica Planning Document**

## **1\. Overview**

This document outlines the core architecture and database details for **Chromatica**, focusing on its Database Schema, Triggers, Functions, Data Flow, Relationships, and Update Mechanisms.

### **Key Sections:**

* **Authentication**: Overview of the authentication strategy using Spotify OAuth.  
* **Database Schema**: Detailed description of tables, columns, constraints, and data types.  
* **Triggers**: Automated actions to maintain data integrity.  
* **Functions**: Custom PostgreSQL functions for data manipulation.  
* **Data Flow and Relationships**: How tables interact and relate.  
* **Update Mechanisms**: Strategies for keeping statistics and other derived data up-to-date.

## **2\. Authentication**

* **Method**: Use of **Spotify OAuth** for user authentication.  
* **Considerations**:  
  * No local password storage is required.  
  * Possible compliance concerns with federal data privacy requirements.  
* **Options**:  
  * Use **Supabase**'s built-in Spotify OAuth for token management.  
  * Alternatively, manage Spotify connections independently in a dedicated table.

## **3\. Database Schema**

### **3.1 Users Table**

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `uuid` | Primary Key, Default | Unique identifier for each user |
| spotify\_id | `VARCHAR(255)` | Unique | Spotify's unique identifier for each user |
| username | `VARCHAR(255)` | Unique, Not Null | Username pulled from Spotify |
| email | `TEXT` | Unique, Not Null | Email pulled from Spotify |
| avatar\_url | `TEXT` |  | URL of user’s profile image |
| profile\_visibility | `TEXT` |  | Profile visibility ('public' or 'private') |
| friend\_count | `INT` | Default 0 | Number of accepted friends the user has |
| is\_spotify\_connected | `BOOLEAN` | Default false | Indicates if Spotify account is connected |
| last\_spotify\_sync | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp of last Spotify sync |
| created\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp of creation |
| updated\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp of last update |
| deleted\_at | `TIMESTAMP WITH TIME ZONE` |  | Timestamp of soft delete |

**Additional Considerations**:

* A PostgreSQL trigger can update the `friend_count` whenever a new friendship is accepted.

### **3.2 Generated Content Table**

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `UUID` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the generated content |
| user\_id | `uuid` | Not Null, Foreign Key (`users.id`) | ID of the user who generated the content |
| content\_type | `TEXT` |  | Type of content ('song' or 'playlist') |
| content\_name | `TEXT` |  | Name of generated song or playlist |
| spotify\_content\_id | `TEXT` |  | Spotify content ID of song/playlist if added |
| creation\_parameters | `JSONB` |  | Tracks moods/events selected |
| created\_at | `TIMESTAMP WITH TIMEZONE` | DEFAULT now() | Creation timestamp |
| added\_to\_spotify | `BOOLEAN` |  | Whether the content was added to Spotify |

**Considerations**:

* Use `creation_parameters` and `added_to_spotify` for future data analysis.

### **3.3 Generated Songs Table**

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `uuid` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the generated song |
| user\_id | `UUID` | Not Null, Foreign Key (`users.id`) | ID of the user who generated the song |
| song\_image\_url | `TEXT` |  | Image URL for the song |
| track\_name | `TEXT` |  | Name of the track |
| artist | `TEXT` |  | Artist name |
| spotify\_track\_id | `TEXT` |  | Spotify track ID |

**Considerations**:

* A trigger can automatically delete the oldest songs once the user has generated over 100 songs.

### **3.4 Generated Playlist Table**

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `uuid` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the generated playlist |
| user\_id | `UUID` | Not Null, Foreign Key (`users.id`) | ID of the user who generated the playlist |
| playlist\_image\_url | `TEXT` |  | Image URL for the playlist |
| spotify\_playlist\_id | `TEXT` |  | Spotify playlist ID |

**Considerations**:

* Allow users to choose playlist images based on moods, events, or custom emojis.

### **3.5 Friendship Table**

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `UUID` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the friendship |
| user\_id | `uuid` | Not Null, Foreign Key (`users.id`) | ID of the user |
| friend\_id | `uuid` | Not Null, Foreign Key (`users.id`) | ID of the friend |
| friendship\_status | `TEXT` | Not Null | Status of friendship ('pending', 'accepted', 'blocked') |
| created\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp when the friendship was initiated |
| updated\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp when the friendship status was updated |

**Indexes & Constraints**:

* Check constraint for valid status values: `('pending', 'accepted', 'blocked')`.  
* Unique index to prevent duplicate friendships.

### **3.6 User Moods Table**

This table tracks the moods associated with the content generated by the user. Each time content is created with a specific mood, the frequency is incremented.

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `UUID` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the mood entry |
| user\_id | `UUID` | Not Null, Foreign Key (`users.id`) | References the user who created the content |
| mood | `TEXT` | Not Null | The mood associated with the content |
| frequency | `INT` | Default 1 | Increments whenever a playlist or song is created with this mood |
| updated\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp of the last update |

**Considerations**:

* The `frequency` column and `updated_at` timestamp help in determining the most popular moods over time.

### **3.7 User Events Table**

This table captures the events linked to user-generated content, tracking how often a particular event is selected.

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `UUID` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the event entry |
| user\_id | `UUID` | Not Null, Foreign Key (`users.id`) | References the user who created the content |
| event | `TEXT` | Not Null | The event associated with the content |
| frequency | `INT` | Default 1 | Increments whenever a playlist or song is created with this event |
| updated\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp of the last update |

**Considerations**:

* Frequency data helps identify trending events for each user.

### **3.8 User Genres Table**

This table tracks genres selected during content generation, recording how often each genre is used by the user.

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `UUID` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the genre entry |
| user\_id | `UUID` | Not Null, Foreign Key (`users.id`) | References the user who created the content |
| genre | `TEXT` | Not Null | Name of the genre |
| frequency | `INT` | Default 1 | Increments whenever a playlist or song is created with this genre |
| updated\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp of the last update |

**Considerations**:

* Use this data to calculate the user's favorite genres over different time periods.

### **3.9 User Stats Table**

The `user_stats` table aggregates data on user behavior, tracking the most frequent moods, events, and genres over different time periods. It also keeps track of playlist and song creation counts.

| Column Name | Data Type | Constraints | Description |
| ----- | ----- | ----- | ----- |
| id | `UUID` | Primary Key, Default uuid\_generate\_v4() | Unique identifier for the stats entry |
| user\_id | `UUID` | Not Null, Foreign Key (`users.id`) | References the user whose stats are being tracked |
| playlists\_created | `INT` | Default 0 | Total number of playlists created by the user |
| songs\_created | `INT` | Default 0 | Total number of songs created by the user |
| most\_frequent\_mood\_1w | `TEXT` |  | User's most frequent mood over the past week |
| most\_frequent\_event\_1w | `TEXT` |  | User's most frequent event over the past week |
| most\_frequent\_genre\_1w | `TEXT` |  | User's most frequent genre over the past week |
| most\_frequent\_mood\_1m | `TEXT` |  | User's most frequent mood over the past month |
| most\_frequent\_event\_1m | `TEXT` |  | User's most frequent event over the past month |
| most\_frequent\_genre\_1m | `TEXT` |  | User's most frequent genre over the past month |
| most\_frequent\_mood\_6m | `TEXT` |  | User's most frequent mood over the past six months |
| most\_frequent\_event\_6m | `TEXT` |  | User's most frequent event over the past six months |
| most\_frequent\_genre\_6m | `TEXT` |  | User's most frequent genre over the past six months |
| all\_time\_most\_frequent\_mood | `TEXT` |  | User's most frequent mood of all time |
| all\_time\_most\_frequent\_event | `TEXT` |  | User's most frequent event of all time |
| all\_time\_most\_frequent\_genre | `TEXT` |  | User's most frequent genre of all time |
| created\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp when the first song/mood, etc. was created |
| last\_calculated\_at | `TIMESTAMP WITH TIME ZONE` |  | Last time the stats were updated |
| updated\_at | `TIMESTAMP WITH TIME ZONE` | Default now() | Timestamp of the last update |

**Considerations**:

* Use data from **User Moods**, **Events**, and **Genres** tables to populate the most frequent entries.  
* Track activity trends over different time frames to give users insights into their listening habits.  
* Consider using PostgreSQL functions to automate updates of this table periodically.

## **4\. Triggers**

### **4.1 Users Table**

* **Update Timestamp Trigger**: Updates the `updated_at` column on any change.

sql  
`CREATE TRIGGER update_users_updated_at`  
`BEFORE UPDATE ON users`  
`FOR EACH ROW`  
`EXECUTE FUNCTION update_updated_at_column();`

### **4.2 Songs Table**

* **Limit Songs Trigger**: Deletes the oldest songs if the user's song count exceeds 100\.

sql  
`CREATE TRIGGER limit_songs_trigger`  
`AFTER INSERT ON generated_songs`  
`FOR EACH ROW`  
`EXECUTE FUNCTION limit_generated_songs();`

### **4.3 Friendships Table**

* **Friend Count Update Trigger**: Adjusts the `friend_count` when a friendship status is updated.

sql  
`CREATE TRIGGER update_friend_count_trigger`  
`AFTER UPDATE OF friendship_status ON friendships`  
`FOR EACH ROW`  
`WHEN (NEW.friendship_status IS DISTINCT FROM OLD.friendship_status)`  
`EXECUTE FUNCTION update_friend_count();`

## **5\. Functions**

### **5.1 General Functions**

* **Update `updated_at` Column**: A common function for updating timestamps.

sql  
`CREATE OR REPLACE FUNCTION update_updated_at_column()`  
`RETURNS TRIGGER AS $$`  
`BEGIN`  
    `NEW.updated_at = CURRENT_TIMESTAMP;`  
    `RETURN NEW;`  
`END;`  
`$$ LANGUAGE 'plpgsql';`

### **5.2 Songs Table Functions**

* **Limit Generated Songs**: Automatically deletes older songs beyond a 100 songs per user. 

sql  
`CREATE OR REPLACE FUNCTION limit_generated_songs()`  
`RETURNS TRIGGER AS $$`  
`BEGIN`  
    `IF (SELECT COUNT(*) FROM generated_songs WHERE user_id = NEW.user_id) > 100 THEN`  
        `DELETE FROM generated_songs`  
        `WHERE id IN (`  
            `SELECT id`  
            `FROM generated_songs`  
            `WHERE user_id = NEW.user_id`  
            `ORDER BY id DESC`  
            `OFFSET 100`  
        `);`  
    `END IF;`  
    `RETURN NEW;`  
`END;`  
`$$ LANGUAGE 'plpgsql';`

### **5.3 Friendships Table Functions**

* **Update Friend Count**: Adjusts a user’s `friend_count` when a friendship is accepted or removed.

sql  
`CREATE OR REPLACE FUNCTION update_friend_count()`  
`RETURNS TRIGGER AS $$`  
`BEGIN`  
    `IF NEW.friendship_status = 'accepted' AND`   
       `(OLD.friendship_status IS NULL OR OLD.friendship_status != 'accepted') THEN`  
        `UPDATE users`   
        `SET friend_count = friend_count + 1`  
        `WHERE id = NEW.user_id;`  
    `ELSIF OLD.friendship_status = 'accepted' AND NEW.friendship_status != 'accepted' THEN`  
        `UPDATE users`   
        `SET friend_count = GREATEST(friend_count - 1, 0);`  
    `END IF;`  
    `RETURN NEW;`  
`END;`  
`$$ LANGUAGE 'plpgsql';`

### **5.4 Playlist Table Functions**

* ### Updates all associated song records when a playlist’s `added_to_spotify` field is modified.

## 

## 

## 

## 

## **6\. Data Flow and Relationships**

**![][image1]**

[image1]: <data:image/png;base64,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>