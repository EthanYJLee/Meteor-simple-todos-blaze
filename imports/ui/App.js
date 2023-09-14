import { Template } from 'meteor/templating';
import { TasksCollection } from '../api/TasksCollection';
import { ReactiveDict } from 'meteor/reactive-dict';
import './App.html';
import './Task.js';
import './Login.js';

const HIDE_COMPLETED_STRING = "hideCompleted";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
const getTasksFilter = () => {
    const user = getUser();

    const hideCompletedFilter = { isChecked: {$ne : true } };

    const userFilter = user ? { userId: user._id } : {};

    const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter};

    return { userFilter, pendingOnlyFilter };
}
// Template.mainContainer.helpers({
//   tasks: [
//     { text: 'This is task 1' },
//     { text: 'This is task 2' },
//     { text: 'This is task 3' },
//   ],
// });
Template.mainContainer.onCreated(function mainContainerOnCreated(){
    this.state = new ReactiveDict();
})

Template.mainContainer.events({
    "click #hide-completed-button"(event, instance){
        const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
        instance.state.set(HIDE_COMPLETED_STRING, !currentHideCompleted);
    },
    'click .user'(){
        Meteor.logout();
    }
    
})
Template.mainContainer.helpers({
    tasks(){
        // return TasksCollection.find({}, { sort: { createdAt: -1 } });
        
        /// task 완료 여부 필터링
        const instance = Template.instance();
        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);

        // const hideCompletedFilter = { isChecked: { $ne: true } };

        const { pendingOnlyFilter, userFilter } = getTasksFilter();

        if (!isUserLogged()){
            return [];
        }

        // return TasksCollection.find(hideCompleted ? hideCompletedFilter : {}, {
        //     sort: { createdAt: -1 },
        // }).fetch();
        return TasksCollection.find(hideCompleted ? pendingOnlyFilter : userFilter, {
            sort: {createdAt: -1},
        }).fetch();

    },
    
    hideCompleted(){
        return Template.instance().state.get(HIDE_COMPLETED_STRING);
    },

    incompleteCount(){
        if(!isUserLogged){
            return '';
        }
        const { pendingOnlyFilter } = getTasksFilter();

        // const incompleteTasksCount = TasksCollection.find({ isChecked: { $ne: true } }).count();
        const incompleteTasksCount = TasksCollection.find(pendingOnlyFilter).count();
        return incompleteTasksCount ? `(${incompleteTasksCount})` : '';
    },

    isUserLogged(){
        return isUserLogged();
    },

    getUser(){
        return getUser();
    }
})

Template.form.events({
    "submit .task-form"(event) {
        console.log(event);

        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        TasksCollection.insert({
            text,
            userId: getUser()._id,
            createdAt: new Date(), // current time
        })

        // Clear form
        target.text.value = "";
    }
})