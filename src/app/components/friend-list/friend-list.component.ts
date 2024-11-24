import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  addOutline,
  removeOutline,
  checkmarkOutline,
  personRemoveSharp,
  removeCircleOutline,
} from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Friendship, User } from '../../models/database.types';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon],
})
export class FriendListComponent implements OnInit {
  username: string = '';
  friendships: Friendship[] = [];
  user: User = {
    avatar_url: null,
    created_at: null,
    deleted_at: null,
    email: '',
    friend_count: null,
    id: '',
    is_spotify_connected: null,
    last_spotify_sync: null,
    profile_visibility: null,
    spotify_id: null,
    updated_at: null,
    username: null,
    social_score: null,
    push_notifications: null,
    email_notifications: null,
  };
  friendToBlock: Friendship | null = null;

  constructor(
    private navCtrl: NavController,
    private supabase: SupabaseService,
    private toast: ToastService
  ) {
    addIcons({
      chevronBackOutline,
      addOutline,
      removeOutline,
      checkmarkOutline,
      personRemoveSharp,
      removeCircleOutline,
    });
  }

  ngOnInit() {
    //get user and set it to user variable
    const user = localStorage.getItem('user');
    if (!user) {
      this.toast.showToast('user not found', 'error');
      return;
    }
    this.user = JSON.parse(user);

    //get friendships and set it to friendships variable
    const friendships = localStorage.getItem('friendships');
    if (friendships) {
      this.friendships = JSON.parse(friendships);
    }
  }

  navigateBack() {
    this.navCtrl.navigateBack('/tabs/social', { animated: false });
  }

  setFriendToBlock(friend: Friendship) {
    this.friendToBlock = friend;
    (document.getElementById('block_prompt') as HTMLDialogElement).showModal();
  }

  addUser() {
    // check if username is empty
    if (this.username === '') {
      this.toast.showToast('please enter a username', 'error');
      return;
    }

    //check if username is the same as current user
    if (this.username === this.user.username) {
      this.toast.showToast('cannot add yourself', 'error');
      return;
    }

    //check friendships array to see if user is already a friend/pending request
    for (let friendship of this.friendships) {
      if (
        (friendship.user_details?.username === this.username ||
        friendship.friend_details?.username === this.username)
      ) {
        if (friendship.friendship_status === 'blocked') {
          //unblock user and delete friendship
          this.supabase
            .getClient()
            .from('friendships')
            .delete()
            .eq('id', friendship.id)
            .then((data) => {
              if (data.error) {
                console.error('failed to unblock user:', data.error);
                this.toast.showToast('failed to unblock user', 'error');
              } else {
                this.toast.showToast('user unblocked successfully', 'success');
                // remove from friendships array
                this.friendships = this.friendships.filter(
                  (f) => f.id !== friendship.id
                );
                // update local storage
                localStorage.setItem(
                  'friendships',
                  JSON.stringify(this.friendships)
                );
              }
            });
          return;
        } else {
          this.toast.showToast(
            'user is already a friend or request is pending',
            'error'
          );
          return;
        }
      }
    }

    // check if username exists in database
    this.supabase
      .getClient()
      .from('users')
      .select('*')
      .eq('username', this.username)
      .then((data) => {
        if (data.error) {
          console.error('failed to fetch user:', data.error);
          this.toast.showToast('failed to fetch user', 'error');
        } else {
          const users = data.data as User[]; // Explicitly specify that data.data is an array of User

          if (users.length === 0) {
            this.toast.showToast('user not found', 'error');
            return;
          } else {
            // add user to friends
            this.supabase
              .getClient()
              .from('friendships')
              .insert({
                user_id: this.user.id,
                friend_id: users[0].id,
                friendship_status: 'pending',
              })
              .select()
              .then((data) => {
                if (data.error) {
                  console.error('failed to send request:', data.error);
                  this.toast.showToast('failed to send request', 'error');
                } else {
                  console.log("data");
                  this.toast.showToast('request sent successfully', 'success');
                  // add request to friendships array
                  if (data.data) {
                    // create user and friend details objects
                    const user_details: User = { ...this.user };
                    const friend_details: User = {
                      id: users[0].id,
                      username: users[0].username,
                      avatar_url: users[0].avatar_url,
                      created_at: null,
                      deleted_at: null,
                      email: '',
                      friend_count: null,
                      is_spotify_connected: null,
                      last_spotify_sync: null,
                      profile_visibility: null,
                      spotify_id: null,
                      updated_at: null,
                      social_score: null,
                      push_notifications: null,
                      email_notifications: null,
                    };

                    this.friendships.push({
                      id: data.data[0].id,
                      user_id: this.user.id,
                      friend_id: users[0].id,
                      friendship_status: 'pending',
                      user_details: user_details,
                      friend_details: friend_details,
                      created_at: null,
                      updated_at: null,
                    });

                    //add to local storage
                    localStorage.setItem(
                      'friendships',
                      JSON.stringify(this.friendships)
                    );
                  }
                }
              });
          }
        }
      });
  }

  cancelRequest(friendship: Friendship) {
    this.supabase
      .getClient()
      .from('friendships')
      .delete()
      .eq('id', friendship.id)
      .then((data) => {
        if (data.error) {
          console.error('failed to cancel request:', data.error);
          this.toast.showToast('failed to cancel request', 'error');
        } else {
          this.toast.showToast('request cancelled successfully', 'success');
          // remove request from friendships array
          this.friendships = this.friendships.filter(
            (f) => f.id !== friendship.id
          );
          // remove from local storage
          localStorage.setItem('friendships', JSON.stringify(this.friendships));
        }
      });
  }

  deleteRequest(friendship: Friendship) {
    console.log(friendship);
    // delete request from database
    this.supabase
      .getClient()
      .from('friendships')
      .delete()
      .eq('id', friendship.id)
      .then((data) => {
        console.log(data.data);
        if (data.error) {
          console.error('failed to delete request:', data.error);
          this.toast.showToast('failed to delete request', 'error');
        } else {
          this.toast.showToast('request deleted successfully', 'success');
          //remove request from friendships array
          this.friendships = this.friendships.filter(
            (f) => f.id !== friendship.id
          );
        }
      });
  }

  acceptRequest(friendship: Friendship) {
    this.supabase
      .getClient()
      .from('friendships')
      .update({ friendship_status: 'accepted' })
      .eq('id', friendship.id)
      .then((data) => {
        if (data.error) {
          console.error('failed to accept request:', data.error);
          this.toast.showToast('failed to accept request', 'error');
        } else {
          this.toast.showToast('request accepted successfully', 'success');
          // update friendship status in friendships array
          this.friendships = this.friendships.map((f) => {
            if (f.id === friendship.id) {
              f.friendship_status = 'accepted';
            }
            return f;
          });
          // update local storage
          localStorage.setItem('friendships', JSON.stringify(this.friendships));
        }
      });
  }

  removeFriend(friendship: Friendship) {
    this.supabase
      .getClient()
      .from('friendships')
      .delete()
      .eq('id', friendship.id)
      .then((data) => {
        if (data.error) {
          console.error('failed to remove friend:', data.error);
          this.toast.showToast('failed to remove friend', 'error');
        } else {
          this.toast.showToast('friend removed successfully', 'success');
          // remove friend from friendships array
          this.friendships = this.friendships.filter(
            (f) => f.id !== friendship.id
          );
          // update local storage
          localStorage.setItem('friendships', JSON.stringify(this.friendships));
        }
      });
  }

  blockFriend() {
    if (this.friendToBlock) {
      this.supabase
        .getClient()
        .from('friendships')
        .update({ friendship_status: 'blocked' })
        .eq('id', this.friendToBlock.id)
        .then((data) => {
          if (data.error) {
            console.error('failed to block user:', data.error);
            this.toast.showToast('failed to block user', 'error');
          } else {
            this.toast.showToast('user blocked successfully', 'success');

            // update friendship status in friendships array 
            this.friendships = this.friendships.map((f) => {
              if (this.friendToBlock && f.id === this.friendToBlock.id) {
                f.friendship_status = 'blocked';
              }
              return f;
            });
            // update local storage
            localStorage.setItem(
              'friendships',
              JSON.stringify(this.friendships)
            );
          }
        });
    }
  }
}
