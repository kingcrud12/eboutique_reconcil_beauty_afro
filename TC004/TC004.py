import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from TC004.test_buying_product_non_authenticated import TestBuyingProductNonAuthenticated


def test_buying_product_non_authenticated():
    test = TestBuyingProductNonAuthenticated()
    test.run()


if __name__ == "__main__":
    test_buying_product_non_authenticated()
