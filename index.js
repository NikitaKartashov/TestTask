const dotenv = require('dotenv');
const axios = require('axios');
const schedule = require('node-schedule');

dotenv.config({ path: './config.env' });

schedule.scheduleJob('0 * * * *', async () => {
    await main()
})

async function getOrdersResponse(hours = 1) {
    const now = new Date()
    const oneHourAgo = new Date()
    oneHourAgo.setHours(now.getHours() - hours);
    const ordersResponse = await axios.get(
        `https://app.orderdesk.me/api/v2/orders?search_start_date=${oneHourAgo.toUTCString()}&search_end_date=${now.toUTCString()}`,
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
      return { id: item.id, shippingAddress: item.shipping.address1 }
    });
    return ordersIdAndAddress;
}

function displayOrders(filteredOrders) {
    filteredOrders.forEach(item => console.log({id: item.id, shippingAddress: item.shippingAddress}));
}

async function main() {
    const ordersResponse = await getOrdersResponse()
    const orders = mapToOrders(ordersResponse)
    displayOrders(orders)
}