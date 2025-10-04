
#include <iostream>
#include <fstream>
#include <string>
#include "httplib.h"
using namespace httplib;

std::string slurp(const std::string &path) {
    std::ifstream in(path, std::ios::in | std::ios::binary);
    if (!in) return "{}";
    std::string contents; in.seekg(0, std::ios::end); contents.resize(in.tellg()); in.seekg(0, std::ios::beg); in.read(&contents[0], contents.size()); return contents;
}

int main() {
    Server svr;
    svr.Get("/products.json", [&](const Request&, Response& res){
        std::string data = slurp("products.json");
        res.set_content(data, "application/json; charset=utf-8");
    });
    svr.Post("/checkout", [&](const Request& req, Response& res){
        std::string body = req.body;
        std::ofstream out("orders.json", std::ios::app);
        if (out) {
            out << body << std::endl;
            out.close();
            res.set_content("{\"status\":\"ok\",\"orderId\":\"" + std::to_string(rand()%1000000) + "\"}", "application/json; charset=utf-8");
        } else {
            res.status = 500;
            res.set_content("{\"status\":\"error\"}", "application/json; charset=utf-8");
        }
    });
    svr.set_mount_point("/", "./public");
    std::cout << "C++ server running on http://localhost:8080/ (requires httplib.h)" << std::endl;
    svr.listen("0.0.0.0", 8080);
    return 0;
}
