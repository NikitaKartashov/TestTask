const dotenv = require('dotenv');
const axios = require('axios');
const schedule = require('node-schedule');

dotenv.config({ path: './config.env' });

schedule.scheduleJob('0 * * * *', async () => {
    await main()
})

async function getOrdersResponse() {
    const ordersResponse = await axios.get(
        'https://app.orderdesk.me/api/v2/orders',
        {
            headers: { 'ORDERDESK-STORE-ID': process.env.ORDERDESK_STORE_ID , 'ORDERDESK-API-KEY': process.env.ORDERDESK_API_KEY }
        }
    )
        if(ordersResponse.status == 200 && ordersResponse?.data.orders != []) {
            return ordersResponse.data.orders
        }
}

function mapToOrders(ordersResponse) {
    const ordersIdAndAddress = ordersResponse.map(item => {
      return { id: item.id, shippingAddress: item.shipping.address1, dateAdded: new Date(item.date_added + ' UTC') }
    });
    return ordersIdAndAddress;
}

function filterOrdersByTime(orders, hours = 1) {
    const relevantDate = new Date();
    relevantDate.setHours(relevantDate.getHours() - hours);
    const filteredOrders = orders.filter(item => item.dateAdded > relevantDate);
    return filteredOrders;
}

function displayOrders(filteredOrders) {
    filteredOrders.forEach(item => console.log({id: item.id, shippingAddress: item.shippingAddress}));
}

async function main() {
    const ordersResponse = await getOrdersResponse()
    const orders = mapToOrders(ordersResponse)
    const filteredOrders = filterOrdersByTime(orders)
    displayOrders(filteredOrders)
}