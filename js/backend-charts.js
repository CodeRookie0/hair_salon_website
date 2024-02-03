var engagementBarChart = document.getElementById('engagementBarChart').getContext('2d');
var barChart = new Chart(engagementBarChart, {
    type: 'bar',
    data: {
        labels: ['Images', 'Videos', 'Text Posts'],
        datasets: [{
            label: 'Average Engagement',
            data: [50, 75, 30],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'User Engagement per Post Type'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

var activityLineGraph = document.getElementById('activityLineGraph').getContext('2d');
var lineGraph = new Chart(activityLineGraph, {
    type: 'line',
    data: {
        labels: ['January', 'February', 'March', 'April'],
        datasets: [{
            label: 'Number of Posts',
            data: [20, 40, 50, 80],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Monthly Activity Trend'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

var followersGrowthAreaChart = document.getElementById('followersGrowthAreaChart').getContext('2d');
var areaChart = new Chart(followersGrowthAreaChart, {
    type: 'line',
    data: {
        labels: ['January', 'February', 'March', 'April'],
        datasets: [{
            label: 'Number of Followers',
            data: [200, 400, 600, 1000],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Followers Growth Over Time'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

var userInteractionsBarChart = document.getElementById('userInteractionsBarChart').getContext('2d');
var interactionsBarChart = new Chart(userInteractionsBarChart, {
    type: 'bar',
    data: {
        labels: ['Likes', 'Comments', 'Shares'],
        datasets: [{
            label: 'User Interactions',
            data: [120, 90, 45],
            backgroundColor: [
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255, 159, 64, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'User Interactions'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});