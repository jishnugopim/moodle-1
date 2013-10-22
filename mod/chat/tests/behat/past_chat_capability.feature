@mod @mod_chat @_switch_window
Feature: Past chat sessions
  In order to prevent students from accessing past chat sessions
  As a teacher
  I need to change capabilities and settings

  Background:
    Given the following "courses" exists:
      | fullname | shortname | category | groupmode |
      | Course 1 | C1 | 0 | 1 |
    And the following "users" exists:
      | username | firstname | lastname | email |
      | teacher1 | Teacher | 1 | teacher1@asd.com |
      | student1 | Student | 1 | student1@asd.com |
    And the following "course enrolments" exists:
      | user | course | role |
      | teacher1 | C1 | editingteacher |
      | student1 | C1 | student |
    And I log in as "teacher1"
    And I follow "Course 1"
    And I turn editing mode on
    And I add a "Chat" to section "1" and I fill the form with:
      | Name of this chat room | Example chat room |
      | Description | This is a chat room |
      | Everyone can view past sessions | 1 |
    And I follow "Example chat room"
    And I write in the chat session:
      | Example message from teacher |
    And I log out

  @javascript
  Scenario: Students can view past sessions with mod/chat:readlogs and 'Everyone can view past sessions'
    # The student should be able to see the chat sessions because
    # mod/chat:readlogs and "Everyone can view past sessions" are set:
    Given I log in as "student1"
    And I follow "Course 1"
    When I follow "Example chat room"
    Then I should see past chat sessions with messages:
      | Example message from teacher |

  @javascript
  Scenario: Students can view past sessions with mod/chat:readlogs
    Given I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Example chat room"
    And I follow "Edit settings"
    And I fill the moodle form with:
      | Everyone can view past sessions | 0 |
    And I press "Save and return to course"
    When I follow "Example chat room"
    Then I should see "View past chat sessions"
    Then I log out
    Then I log in as "student1"
    Then I follow "Course 1"
    Then I follow "Example chat room"
    Then I should see past chat sessions with messages:
      | Example message from teacher |

  @javascript
  Scenario: Students should not see past sessions without permission or 'Everyone can view past sessions'
    # The student should now be able to see chat logs because they're not
    # available to all users and the role does not have the override capability
    Given I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Example chat room"
    And I follow "Permissions"
    And I override the system permissions of "Student" role with:
      | mod/chat:readlog | Prevent |
    And I follow "Edit settings"
    And I fill the moodle form with:
      | Everyone can view past sessions | 0 |
    And I press "Save and return to course"
    When I follow "Example chat room"
    Then I should see "View past chat sessions"
    Then I log out
    Then I log in as "student1"
    Then I follow "Course 1"
    Then I follow "Example chat room"
    Then I should not see "View past chat sessions"

  @javascript
  Scenario: Students should see past sessions without permission but with 'Everyone can view past sessions'
    Given I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Example chat room"
    And I follow "Permissions"
    And I override the system permissions of "Student" role with:
      | mod/chat:readlog | Prevent |
    When I follow "Example chat room"
    Then I should see "View past chat sessions"
    Then I log out
    Then I log in as "student1"
    Then I follow "Course 1"
    Then I follow "Example chat room"
    Then I should see past chat sessions with messages:
      | Example message from teacher |
