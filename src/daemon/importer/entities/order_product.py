import xml.etree.ElementTree as ET

class OrderProduct:

    def __init__(self, order_id, product_id, quantity, discount, sales, profit):
        self._order_id = order_id
        self._product_id = product_id
        self._quantity = quantity
        self._discount = discount
        self._sales = sales
        self._profit = profit

    def to_xml(self):
        el = ET.Element("Product")
        el.set("id", str(self._product_id))  
        el.set("quantity", str(self._quantity))  
        el.set("discount", str(self._discount))  
        el.set("sales", str(self._sales))  
        el.set("profit", str(self._profit))  

        return el 

    def get_order_id(self):
        return self._order_id

    def get_product_id(self):
        return self._product_id

    def __str__(self):
        return f"Order ID: {self._order_id}, Product ID: {self._product_id}, Quantity: {self._quantity}, Discount: {self._discount}, Sales: {self._sales}, Profit: {self._profit}"