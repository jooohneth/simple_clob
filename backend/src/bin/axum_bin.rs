use axum::{
    extract::{State, Path}, routing::{get, post}, Json, Router
};
use backend::{OrderBook, order_generator::OrderGenerator};
use std::sync::Arc;
use std::time::SystemTime;
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct MatchDetail {
    pub price: u64,
    pub quantity: u128,
    pub timestamp: SystemTime,
}

#[derive(Serialize, Deserialize)]
pub struct CreateOrderResponse {
    pub status: String,
    pub order_id: u128,
    pub filled_quantity: u128,
    pub remaining_quantity: u128,
    pub matches: Vec<MatchDetail>,
}

#[derive(Serialize, Deserialize)]
pub struct CancelOrderResponse {
    pub status: String,
    pub order_id: u128,
}

#[derive(Serialize, Deserialize)]
pub struct CreateOrder {
    pub buy_order: bool,
    pub price: u64,
    pub quantity: u64,
}

#[derive(Serialize, Deserialize)]
pub struct CancelOrder {
    pub order_id: u128,
}

#[derive(Serialize, Deserialize)]
pub struct OrderStatusResponse {
    pub order_id: u128,
    pub status: String, // "filled", "partial", "open", "not_found"
    pub current_quantity: u128,
    pub is_buy: bool,
    pub price: u64,
}

#[tokio::main]
async fn main() {
    let ord_book = Arc::new(RwLock::new(build_order_book()));

    let cors = CorsLayer::new()
        .allow_origin(
            "http://localhost:5173"
                .parse::<axum::http::HeaderValue>()
                .unwrap(),
        )
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(home))
        .route("/clob-stats", get(clob_stats))
        .route("/orders", post(post_orders))
        .route("/order/{id}", get(get_order_status))
        .route("/cancel", post(cancel_order))
        .with_state(ord_book)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    axum::serve(listener, app).await.unwrap();
}

async fn home() -> &'static str {
    "CLOB API Homepage"
}

async fn clob_stats(State(ord_book): State<Arc<RwLock<OrderBook>>>) -> Json<OrderBook> {
    let ob = ord_book.read().await;
    Json(ob.clone())
}

async fn post_orders(State(ord_book): State<Arc<RwLock<OrderBook>>>, Json(payload): Json<CreateOrder>) -> Json<CreateOrderResponse> {
    let mut ob = ord_book.write().await;
    
    let original_quantity = payload.quantity as u128;
    let transactions_before = ob.get_transaction_count();
    
    let order_id = if payload.buy_order {
        ob.buy(true, payload.price, original_quantity)
    } else {
        ob.sell(false, payload.price, original_quantity)
    };
    
    let order_id = order_id.unwrap();
    
    // Get new transactions that resulted from this order
    let new_transactions = ob.get_transactions_from(transactions_before);
    let matches: Vec<MatchDetail> = new_transactions.iter().map(|tx| MatchDetail {
        price: tx.price,
        quantity: tx.quantity,
        timestamp: tx.time,
    }).collect();
    
    // Calculate filled and remaining quantities
    let filled_quantity: u128 = matches.iter().map(|m| m.quantity).sum();
    let remaining_quantity = original_quantity.saturating_sub(filled_quantity);
    
    Json(CreateOrderResponse { 
        status: "ok".to_string(), 
        order_id,
        filled_quantity,
        remaining_quantity,
        matches,
    })
}

async fn cancel_order(State(ord_book): State<Arc<RwLock<OrderBook>>>, Json(payload): Json<CancelOrder>) -> Json<CancelOrderResponse> {
    let mut ob = ord_book.write().await;
    let _ = ob.cancel(payload.order_id);

    Json(CancelOrderResponse { status: "ok".to_string(), order_id: payload.order_id })
}

async fn get_order_status(State(ord_book): State<Arc<RwLock<OrderBook>>>, Path(id): Path<u128>) -> Json<OrderStatusResponse> {
    let ob = ord_book.read().await;
    
    // Try to find in buy orders
    if let Ok(order) = ob.get_buy_order(id) {
        return Json(OrderStatusResponse {
            order_id: id,
            status: if order.quantity > 0 { "open".to_string() } else { "filled".to_string() },
            current_quantity: order.quantity,
            is_buy: true,
            price: order.price,
        });
    }
    
    // Try to find in sell orders
    if let Ok(order) = ob.get_sell_order(id) {
        return Json(OrderStatusResponse {
            order_id: id,
            status: if order.quantity > 0 { "open".to_string() } else { "filled".to_string() },
            current_quantity: order.quantity,
            is_buy: false,
            price: order.price,
        });
    }
    
    // Order not found (likely fully filled and removed)
    Json(OrderStatusResponse {
        order_id: id,
        status: "not_found".to_string(),
        current_quantity: 0,
        is_buy: false,
        price: 0,
    })
}

fn build_order_book() -> OrderBook {
    let mut ord_book = OrderBook::build();

    if let Some(ord_gen) = OrderGenerator::build(0.5, 0.5) {
        for _ in 0..20 {
            let (buy_sell, price) = ord_gen.gen_order(10.0);
            if buy_sell {
                let _ = ord_book.buy(true, price, 1);
            } else {
                let _ = ord_book.sell(false, price, 1);
            }
        }
    } else {
        println!("Failed to build OrderGenerator!");
    }

    ord_book
}
